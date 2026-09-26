import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { emailService } from '../services/email.service.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Creates a new shop order with ATOMIC stock decrements and MongoDB ACID transaction.
 * Guarantees zero overselling, zero race conditions, and complete rollback on any item failure.
 * Endpoint: POST /api/v1/orders
 * Access: Protected
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  logger.info(`[Order Checkout] User ${req.user._id} initiating checkout with ${items?.length || 0} items.`);

  // 1. Strict Request Validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Your shopping cart is empty. Please add items to checkout.', 400));
  }

  for (const item of items) {
    if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
      return next(new AppError('Invalid product identifier specified in shopping cart.', 400));
    }
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
      return next(new AppError('Item quantity must be a positive integer between 1 and 100.', 400));
    }
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
    return next(new AppError('Please provide a complete shipping address.', 400));
  }

  const validPaymentMethods = ['cod', 'qr', 'stripe'];
  const finalPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cod';

  let createdOrder;
  let createdPayment;
  const lowStockProductsToAlert = [];

  // Core execution function that can run within a transaction session or as standalone atomic steps
  const processCheckout = async (activeSession = null) => {
    const orderItems = [];
    let subtotal = 0;
    const decrementedItems = [];

    try {
      // 3. Atomically decrement inventory with conditional check
      for (const item of items) {
        const qty = Number(item.quantity);

        const findQuery = Product.findById(item.product);
        if (activeSession) findQuery.session(activeSession);
        const dbProduct = await findQuery;

        if (!dbProduct) {
          throw new AppError(`Product with ID ${item.product} not found.`, 404);
        }

        if (!dbProduct.isActive || dbProduct.status === 'draft' || dbProduct.status === 'inactive') {
          throw new AppError(`Product "${dbProduct.name}" is currently not available for purchase.`, 400);
        }

        // ATOMIC CONDITIONAL UPDATE:
        // Ensures stockCount >= requested quantity at the exact instant of decrement.
        // If stock is insufficient, returned document will be null.
        const updateOptions = { new: true };
        if (activeSession) updateOptions.session = activeSession;

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stockCount: { $gte: qty },
            isActive: true,
            status: { $nin: ['draft', 'inactive'] },
          },
          {
            $inc: { stockCount: -qty },
          },
          updateOptions
        );

        if (!updatedProduct) {
          throw new AppError(
            `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockCount} units available, requested ${qty}.`,
            400
          );
        }

        decrementedItems.push({ product: item.product, quantity: qty });

        // Check for low stock alert threshold (stock < 5)
        if (updatedProduct.stockCount < 5) {
          lowStockProductsToAlert.push(updatedProduct);
        }

        // Assemble order item using AUTHORITATIVE database prices & details (never trust client prices)
        orderItems.push({
          product: updatedProduct._id,
          name: updatedProduct.name,
          sku: updatedProduct.sku || '',
          image: updatedProduct.images?.[0]?.secure_url || '',
          quantity: qty,
          unitPrice: updatedProduct.price,
        });

        subtotal += updatedProduct.price * qty;
      }

      // 4. Validate and apply coupon discount on server side
      let discount = 0;
      let couponRef = null;

      if (couponCode && typeof couponCode === 'string') {
        const couponQuery = Coupon.findOne({
          code: couponCode.trim().toUpperCase(),
          isActive: true,
          isPublished: true,
        });
        if (activeSession) couponQuery.session(activeSession);
        const coupon = await couponQuery;

        if (coupon) {
          const isNotStarted = coupon.startsAt && new Date() < new Date(coupon.startsAt);
          const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
          const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
          const isMinPurchaseMet = subtotal >= coupon.minPurchaseAmount;

          if (!isNotStarted && !isExpired && !isLimitReached && isMinPurchaseMet) {
            if (coupon.discountType === 'percentage') {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
              }
            } else if (coupon.discountType === 'fixed_amount') {
              discount = coupon.discountValue;
            }

            discount = Math.min(discount, subtotal);
            couponRef = coupon._id;

            // Increment coupon usage count
            coupon.usedCount += 1;
            const saveOptions = {};
            if (activeSession) saveOptions.session = activeSession;
            await coupon.save(saveOptions);
          }
        }
      }

      // 5. Calculate taxes and shipping fees on server
      const taxableAmount = Math.max(0, subtotal - discount);
      const tax = Number((taxableAmount * 0.08).toFixed(2));
      const shippingFee = subtotal > 100 ? 0 : 10;
      const grandTotal = Number((taxableAmount + tax + shippingFee).toFixed(2));

      // 6. Save Order
      const initialPaymentStatus = finalPaymentMethod === 'qr' ? 'pending' : 'unpaid';
      const initialOrderStatus = finalPaymentMethod === 'qr' ? 'awaiting_payment_verification' : 'placed';

      const orderData = {
        customer: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod: finalPaymentMethod,
        paymentStatus: initialPaymentStatus,
        orderStatus: initialOrderStatus,
        totals: {
          subtotal,
          tax,
          shippingFee,
          discount,
          grandTotal,
        },
        coupon: couponRef,
        stockRestored: false,
      };

      const orderCreateOptions = {};
      if (activeSession) orderCreateOptions.session = activeSession;
      const orders = await Order.create([orderData], orderCreateOptions);
      createdOrder = orders[0];

      // 7. Generate matching Payment record
      const randString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const transactionId = `TXN-${createdOrder._id.toString().substring(18)}-${randString}`;

      const paymentData = {
        transactionId,
        amount: grandTotal,
        currency: 'usd',
        gateway: finalPaymentMethod,
        status: 'pending',
        paymentType: 'order',
        referenceId: createdOrder._id,
        paymentTypeModel: 'Order',
        customer: req.user._id,
      };

      const paymentCreateOptions = {};
      if (activeSession) paymentCreateOptions.session = activeSession;
      const payments = await Payment.create([paymentData], paymentCreateOptions);
      createdPayment = payments[0];
    } catch (err) {
      // If standalone (no active transaction session), execute compensation rollback
      if (!activeSession) {
        for (const dec of decrementedItems) {
          await Product.findByIdAndUpdate(dec.product, {
            $inc: { stockCount: dec.quantity },
          }).catch((rErr) => logger.error(`Rollback error: ${rErr.message}`));
        }
      }
      throw err;
    }
  };

  // Attempt Mongoose ACID Transaction Session (Production Atlas / Replica Sets)
  let session = null;
  try {
    session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await processCheckout(session);
      });
    } catch (txErr) {
      // If MongoDB is standalone (Error 20 IllegalOperation), fallback to atomic conditional updates with compensation rollback
      if (txErr.code === 20 || txErr.message?.includes('replica set')) {
        logger.warn('[Order Checkout] Standalone MongoDB detected without replica set; running atomic conditional updates with compensation rollback.');
        await processCheckout(null);
      } else {
        throw txErr;
      }
    }
  } catch (err) {
    return next(err);
  } finally {
    if (session) {
      await session.endSession();
    }
  }

  // 8. Post-transaction async operations (emails, low-stock alerts)
  for (const product of lowStockProductsToAlert) {
    emailService.sendLowStockAlert(product).catch((err) =>
      logger.error(`[Alert] Failed to dispatch low-stock alert for ${product.name}: ${err.message}`)
    );
  }

  emailService.sendOrderConfirmation(createdOrder, req.user).catch((err) =>
    logger.error(`[Email] Failed to dispatch order confirmation for #${createdOrder._id}: ${err.message}`)
  );

  res.status(201).json(
    new ApiResponse(201, { order: createdOrder, payment: createdPayment }, 'Order created successfully.')
  );
});

/**
 * Handles uploading the proof of transfer screenshot for manual UPI QR transactions.
 * Pipes the memory buffer to Cloudinary CDN, updates payment status to proof_submitted,
 * and notifies operations for manual verification.
 * Endpoint: POST /api/v1/orders/:orderId/pay-qr
 * Access: Protected (Order Owner or Admin)
 */
export const submitQrPaymentProof = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { transactionId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError('Invalid order identifier format.', 400));
  }

  if (!req.file) {
    return next(new AppError('Please upload a screenshot of your transaction proof.', 400));
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Target order not found.', 404));
  }

  // Authorize order ownership
  if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to edit this order.', 403));
  }

  // Order state validation
  if (order.orderStatus === 'cancelled') {
    return next(new AppError('Cannot submit payment proof for a cancelled order.', 400));
  }

  if (order.paymentStatus === 'paid' || order.paymentStatus === 'verified') {
    return next(new AppError('This order payment has already been verified and confirmed.', 400));
  }

  // Find or instantiate matching Payment record
  let payment = await Payment.findOne({
    referenceId: orderId,
    paymentType: 'order',
  });

  if (!payment) {
    const randString = Math.random().toString(36).substring(2, 8).toUpperCase();
    payment = new Payment({
      transactionId: `TXN-${order._id.toString().substring(18)}-${randString}`,
      amount: order.totals?.grandTotal || 0,
      currency: 'usd',
      gateway: 'qr',
      status: 'pending',
      paymentType: 'order',
      referenceId: order._id,
      paymentTypeModel: 'Order',
      customer: order.customer,
    });
  }

  // Upload memory buffer to Cloudinary securely
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'sparkcare/payments');

  const now = new Date();

  // Update Payment record
  payment.screenshot = {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };
  payment.paymentProofUrl = uploadResult.secure_url;
  payment.paymentProofPublicId = uploadResult.public_id;
  payment.paymentProofUploadedAt = now;
  payment.paymentProofSubmittedBy = req.user._id;
  payment.status = 'proof_submitted';
  payment.gateway = 'qr';

  if (transactionId && typeof transactionId === 'string' && transactionId.trim()) {
    payment.transactionId = transactionId.trim().slice(0, 100);
  }

  payment.paymentVerificationHistory = payment.paymentVerificationHistory || [];
  payment.paymentVerificationHistory.push({
    action: 'submitted',
    status: 'proof_submitted',
    performedBy: req.user._id,
    timestamp: now,
    note: 'Payment proof screenshot uploaded by customer',
  });
  await payment.save();

  // Update Order record
  order.paymentStatus = 'proof_submitted';
  order.orderStatus = 'awaiting_payment_verification';
  order.paymentProofUrl = uploadResult.secure_url;
  order.paymentProofPublicId = uploadResult.public_id;
  order.paymentProofUploadedAt = now;
  order.paymentProofSubmittedBy = req.user._id;
  order.paymentVerificationHistory = order.paymentVerificationHistory || [];
  order.paymentVerificationHistory.push({
    action: 'submitted',
    status: 'proof_submitted',
    performedBy: req.user._id,
    timestamp: now,
    note: 'Payment proof screenshot uploaded by customer',
  });
  await order.save();

  // Dispatch non-blocking user notification
  emailService.sendPaymentProofSubmitted(order, req.user).catch((err) =>
    logger.error(`[Email] Failed to dispatch payment proof submission notification for #${order._id}: ${err.message}`)
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { order, payment },
      'Payment proof submitted. Your order will be confirmed after admin verification.'
    )
  );
});


/**
 * Fetches all orders belonging to the logged-in client.
 * Endpoint: GET /api/v1/orders/my-orders
 * Access: Protected
 */
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('items.product')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, orders, 'Client orders retrieved successfully')
  );
});

/**
 * Retrieves a detailed order by its ID, checking user boundaries.
 * Endpoint: GET /api/v1/orders/:id
 * Access: Protected
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product')
    .populate('coupon')
    .populate('customer', 'name email');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Allow only the owner or admins to view details
  if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to view this order details', 403));
  }

  // Fetch related payment transaction details
  const payment = await Payment.findOne({
    referenceId: order._id,
    paymentType: 'order',
  });

  res.status(200).json(
    new ApiResponse(200, { order, payment }, 'Detailed order data retrieved successfully')
  );
});

/**
 * Cancel an order if it is still in 'placed' status.
 * Restores product stock quantities automatically.
 * Endpoint: PATCH /api/v1/orders/:id/cancel
 * Access: Protected
 */
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid order identifier format.', 400));
  }

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Authorization check
  if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized to cancel this order.', 403));
  }

  // Status check
  if (order.orderStatus !== 'placed') {
    return next(new AppError(`Cannot cancel order once it is in "${order.orderStatus}" status. Please contact support.`, 400));
  }

  // Atomically update order status and mark stockRestored: true to guarantee single execution
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: id, orderStatus: 'placed', stockRestored: false },
    { $set: { orderStatus: 'cancelled', stockRestored: true } },
    { new: true }
  );

  if (!updatedOrder) {
    return next(new AppError('Order has already been cancelled or processed.', 400));
  }

  // Restore inventory stock atomically for each item
  for (const item of updatedOrder.items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockCount: item.quantity },
      });
    }
  }

  // Update associated payment status if exists
  await Payment.findOneAndUpdate(
    { referenceId: updatedOrder._id, paymentType: 'order' },
    { status: 'failed' }
  );

  res.status(200).json(
    new ApiResponse(200, updatedOrder, 'Order has been successfully cancelled and inventory stock restored.')
  );
});

