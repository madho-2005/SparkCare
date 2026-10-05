import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { Product } from '../models/Product.js';
import { Service } from '../models/Service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { emailService } from '../services/email.service.js';
import { logger } from '../utils/logger.js';

/**
 * Compiles gross revenues, jobs status logs, and top products telemetry.
 * Endpoint: GET /api/v1/admin/stats
 * Access: Admin Only
 */
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, from, to } = req.query;

  // 1. Enforce Bounded Date Range (Default: last 30 days, Max: 365 days)
  let end = new Date();
  let start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const rawStart = startDate || from;
  const rawEnd = endDate || to;

  if (rawStart) {
    const parsedStart = new Date(rawStart);
    if (isNaN(parsedStart.getTime())) {
      return next(new AppError('Invalid startDate format provided.', 400));
    }
    start = parsedStart;
  }

  if (rawEnd) {
    const parsedEnd = new Date(rawEnd);
    if (isNaN(parsedEnd.getTime())) {
      return next(new AppError('Invalid endDate format provided.', 400));
    }
    end = parsedEnd;
  }

  if (start.getTime() > end.getTime()) {
    return next(new AppError('Start date cannot be after end date.', 400));
  }

  const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
  if (end.getTime() - start.getTime() > maxRangeMs) {
    return next(new AppError('Requested date range exceeds maximum allowed limit of 365 days.', 400));
  }

  // 2. High-speed MongoDB Aggregations for Revenues (replaces unbounded memory loading)
  const [orderRevAgg, bookingRevAgg] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['paid', 'verified'] },
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totals.grandTotal' },
        },
      },
    ]),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['paid', 'verified'] },
          bookingStatus: { $ne: 'cancelled' },
          scheduledDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]),
  ]);

  const ordersRevenue = orderRevAgg[0]?.total || 0;
  const bookingsRevenue = bookingRevAgg[0]?.total || 0;
  const grossRevenue = ordersRevenue + bookingsRevenue;

  // 3. Compact Counts and KPI summaries
  const [
    totalUsers,
    totalOrders,
    totalBookings,
    pendingBookings,
    pendingOrders,
    lowStockProductsCount,
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'scheduled' }),
    Order.countDocuments({ orderStatus: 'placed' }),
    Product.countDocuments({ stockCount: { $lt: 5 } }),
  ]);

  // 4. Status Distributions via MongoDB $group pipelines
  const [bookingStatusCounts, orderStatusCounts] = await Promise.all([
    Booking.aggregate([
      { $match: { scheduledDate: { $gte: start, $lte: end } } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  // 5. Dynamic Sales History by Month (aggregates real MongoDB Orders and Bookings)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [monthlyOrdersAgg, monthlyBookingsAgg] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['paid', 'verified'] },
          orderStatus: { $ne: 'cancelled' },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$totals.grandTotal' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Booking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['paid', 'verified'] },
          bookingStatus: { $ne: 'cancelled' },
          scheduledDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' },
          },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  // Build a map of months spanning the requested range
  const salesHistoryMap = new Map();
  const iterDate = new Date(start);
  while (iterDate <= end) {
    const key = `${iterDate.getFullYear()}-${iterDate.getMonth() + 1}`;
    const name = monthNames[iterDate.getMonth()];
    if (!salesHistoryMap.has(key)) {
      salesHistoryMap.set(key, { name, orders: 0, services: 0 });
    }
    iterDate.setMonth(iterDate.getMonth() + 1);
  }

  for (const item of monthlyOrdersAgg) {
    const key = `${item._id.year}-${item._id.month}`;
    if (salesHistoryMap.has(key)) {
      salesHistoryMap.get(key).orders = Number(item.total.toFixed(2));
    }
  }

  for (const item of monthlyBookingsAgg) {
    const key = `${item._id.year}-${item._id.month}`;
    if (salesHistoryMap.has(key)) {
      salesHistoryMap.get(key).services = Number(item.total.toFixed(2));
    }
  }

  // Calculate total for each month
  for (const value of salesHistoryMap.values()) {
    value.total = Number((value.orders + value.services).toFixed(2));
  }

  const salesHistory = Array.from(salesHistoryMap.values()).slice(-12);


  res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          grossRevenue: Number(grossRevenue.toFixed(2)),
          ordersRevenue: Number(ordersRevenue.toFixed(2)),
          bookingsRevenue: Number(bookingsRevenue.toFixed(2)),
          totalUsers,
          totalOrders,
          totalBookings,
          pendingBookings,
          pendingOrders,
          lowStockProductsCount,
        },
        distributions: {
          bookings: bookingStatusCounts,
          orders: orderStatusCounts,
        },
        salesHistory,
        dateRange: {
          from: start.toISOString(),
          to: end.toISOString(),
        },
      },
      'Admin overview statistics aggregated successfully'
    )
  );
});

/**
 * Generates audit transaction summaries with bounded pagination.
 * Endpoint: GET /api/v1/admin/reports
 * Access: Admin Only
 */
export const getAdminReports = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const payments = await Payment.find()
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, { payments }, 'Transaction audit reports retrieved successfully')
  );
});

/**
 * Fetches all platform coupons.
 * Endpoint: GET /api/v1/admin/coupons
 * Access: Admin Only
 */
export const getAdminCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons listed successfully'));
});

/**
 * Creates a brand new coupon discount code.
 * Endpoint: POST /api/v1/admin/coupons
 * Access: Admin Only
 */
export const createAdminCoupon = asyncHandler(async (req, res, next) => {
  const {
    code,
    discountType,
    discountValue,
    minPurchaseAmount,
    maxDiscountAmount,
    expiryDate,
    startsAt,
    usageLimit,
    description,
    isPublished,
  } = req.body;

  if (!code || typeof code !== 'string' || !code.trim()) {
    return next(new AppError('Please supply a valid coupon code text.', 400));
  }

  const normalizedCode = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,30}$/.test(normalizedCode)) {
    return next(new AppError('Coupon code must be 3-30 alphanumeric characters (hyphens/underscores allowed).', 400));
  }

  if (!['percentage', 'fixed_amount'].includes(discountType)) {
    return next(new AppError('Discount type must be either "percentage" or "fixed_amount".', 400));
  }

  const numDiscountValue = Number(discountValue);
  if (isNaN(numDiscountValue) || numDiscountValue <= 0) {
    return next(new AppError('Discount value must be a positive number greater than 0.', 400));
  }

  if (discountType === 'percentage' && numDiscountValue > 100) {
    return next(new AppError('Percentage discount cannot exceed 100%.', 400));
  }

  const numMinPurchase = minPurchaseAmount !== undefined && minPurchaseAmount !== null && minPurchaseAmount !== ''
    ? Number(minPurchaseAmount)
    : 0;
  if (isNaN(numMinPurchase) || numMinPurchase < 0) {
    return next(new AppError('Minimum purchase amount cannot be negative.', 400));
  }

  const numMaxDiscount = maxDiscountAmount !== undefined && maxDiscountAmount !== null && maxDiscountAmount !== ''
    ? Number(maxDiscountAmount)
    : null;
  if (numMaxDiscount !== null && (isNaN(numMaxDiscount) || numMaxDiscount <= 0)) {
    return next(new AppError('Maximum discount cap must be a positive number.', 400));
  }

  if (!expiryDate) {
    return next(new AppError('Expiry date is required.', 400));
  }

  const parsedExpiry = new Date(expiryDate);
  if (isNaN(parsedExpiry.getTime())) {
    return next(new AppError('Invalid expiry date format.', 400));
  }

  const parsedStartsAt = startsAt ? new Date(startsAt) : new Date();
  if (isNaN(parsedStartsAt.getTime())) {
    return next(new AppError('Invalid start date format.', 400));
  }

  if (parsedExpiry <= parsedStartsAt) {
    return next(new AppError('Expiry date must be after the start date.', 400));
  }

  const numUsageLimit = usageLimit !== undefined && usageLimit !== null && usageLimit !== ''
    ? Number(usageLimit)
    : null;
  if (numUsageLimit !== null && (isNaN(numUsageLimit) || numUsageLimit <= 0 || !Number.isInteger(numUsageLimit))) {
    return next(new AppError('Usage limit must be a positive integer.', 400));
  }

  const existing = await Coupon.findOne({ code: normalizedCode });
  if (existing) {
    return next(new AppError('A coupon code with this text string already exists.', 400));
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    discountType,
    discountValue: numDiscountValue,
    minPurchaseAmount: numMinPurchase,
    maxDiscountAmount: numMaxDiscount,
    expiryDate: parsedExpiry,
    startsAt: parsedStartsAt,
    usageLimit: numUsageLimit,
    description: description ? String(description).trim() : '',
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    isActive: true,
    createdBy: req.user?._id || null,
    source: 'admin',
  });

  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

/**
 * Updates or toggles an existing coupon.
 * Endpoint: PATCH /api/v1/admin/coupons/:id
 * Access: Admin Only
 */
export const updateAdminCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updates = {};
  const allowedFields = [
    'isActive',
    'isPublished',
    'description',
    'discountValue',
    'minPurchaseAmount',
    'maxDiscountAmount',
    'expiryDate',
    'startsAt',
    'usageLimit',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const coupon = await Coupon.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new AppError('Target coupon not found', 404));
  }

  res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

/**
 * Purges an active discount coupon by ID.
 * Endpoint: DELETE /api/v1/admin/coupons/:id
 * Access: Admin Only
 */
export const deleteAdminCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    return next(new AppError('Target coupon not found', 404));
  }
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

/**
 * Lists all registered users (for admin review).
 * Endpoint: GET /api/v1/admin/users
 * Access: Admin Only
 */
export const getAdminUsers = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role && ['user', 'admin'].includes(req.query.role)) {
    filter.role = req.query.role;
  }

  const users = await User.find(filter)
    .select('-password -refreshTokenHash')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(new ApiResponse(200, users, 'Registered client database loaded successfully'));
});

/**
 * Promotes or alters a user role.
 * Endpoint: PUT /api/v1/admin/users/:id/role
 * Access: Admin Only
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!role || !['user', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified: choose from user or admin', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from inadvertently revoking their own administrative role
  if (req.user && req.user._id.toString() === user._id.toString() && role !== 'admin') {
    return next(new AppError('Administrators cannot revoke their own administrative privileges.', 400));
  }

  user.role = role;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, `User role successfully elevated to: ${role}`));
});

/**
 * Lists all platform orders in detail with bounded pagination.
 * Endpoint: GET /api/v1/admin/orders
 * Access: Admin Only
 */
export const getAdminOrders = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate('customer', 'name email')
    .populate('items.product')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(new ApiResponse(200, orders, 'All orders loaded for administration auditing'));
});

/**
 * Updates status of a shop delivery order.
 * Endpoint: PUT /api/v1/admin/orders/:id/status
 * Access: Admin Only
 */
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderStatus } = req.body;
  if (!orderStatus || !['placed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(orderStatus)) {
    return next(new AppError('Invalid order status update request', 400));
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // If order is transitioned to cancelled and stock was not previously restored, restore stock once
  if (orderStatus === 'cancelled' && !order.stockRestored) {
    order.stockRestored = true;
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockCount: item.quantity },
        });
      }
    }
  }

  order.orderStatus = orderStatus;
  if (orderStatus === 'delivered') {
    order.deliveredAt = new Date();
  }
  await order.save();

  res.status(200).json(new ApiResponse(200, order, `Order status successfully marked as: ${orderStatus}`));
});

/**
 * Lists all pending QR UPI payments awaiting proof authorization.
 * Endpoint: GET /api/v1/admin/payments/pending
 * Access: Admin Only
 */
export const getPendingQrPayments = asyncHandler(async (req, res, next) => {
  const pendingPayments = await Payment.find({
    gateway: 'qr',
    status: { $in: ['pending', 'proof_submitted', 'under_review'] },
    $or: [
      { screenshot: { $ne: null } },
      { paymentProofUrl: { $ne: null } },
    ],
  })
    .populate('customer', 'name email phoneNumber')
    .sort({ createdAt: 1 }); // oldest first to expedite customer verification

  res.status(200).json(
    new ApiResponse(200, pendingPayments, 'Pending QR validation requests loaded')
  );
});

/**
 * Lists all store orders awaiting manual payment verification.
 * Endpoint: GET /api/v1/admin/orders/payment-pending
 * Access: Admin Only
 */
export const getOrdersPaymentPending = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const skip = (page - 1) * limit;

  const orders = await Order.find({
    $or: [
      { orderStatus: 'awaiting_payment_verification' },
      { paymentStatus: { $in: ['proof_submitted', 'under_review', 'pending'] } },
    ],
    orderStatus: { $ne: 'cancelled' },
  })
    .populate('customer', 'name email phoneNumber')
    .populate('items.product')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json(
    new ApiResponse(200, orders, 'Orders awaiting payment verification loaded successfully')
  );
});

/**
 * Admin verifies manual UPI payment for an order.
 * Transitions paymentStatus to 'verified' and orderStatus to 'confirmed'.
 * Records verifying admin, timestamp, and audit review note.
 * Endpoint: PATCH /api/v1/admin/orders/:orderId/payment/verify
 * Access: Admin Only
 */
export const verifyOrderPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { note, reviewNote } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError('Invalid order identifier format.', 400));
  }

  const order = await Order.findById(orderId).populate('customer', 'name email');
  if (!order) {
    return next(new AppError('Target order not found.', 404));
  }

  // Prevent approving cancelled orders
  if (order.orderStatus === 'cancelled') {
    return next(new AppError('Cannot verify payment for a cancelled order.', 400));
  }

  // Prevent double approval
  if (order.paymentStatus === 'verified' || order.paymentStatus === 'paid') {
    return next(new AppError('This order payment has already been verified.', 400));
  }

  const finalNote = (note || reviewNote || 'Payment verified via manual UPI bank records').trim();
  const now = new Date();

  order.paymentStatus = 'verified';
  order.orderStatus = 'confirmed';
  order.paymentVerifiedBy = req.user._id;
  order.paymentVerifiedAt = now;
  order.paymentReviewNote = finalNote;
  order.paymentVerificationHistory = order.paymentVerificationHistory || [];
  order.paymentVerificationHistory.push({
    action: 'verified',
    status: 'verified',
    performedBy: req.user._id,
    timestamp: now,
    note: finalNote,
  });
  await order.save();

  // Find and update matching Payment record
  let payment = await Payment.findOne({ referenceId: order._id, paymentType: 'order' });
  if (payment) {
    payment.status = 'verified';
    payment.paymentVerifiedBy = req.user._id;
    payment.paymentVerifiedAt = now;
    payment.paymentReviewNote = finalNote;
    payment.paymentVerificationHistory = payment.paymentVerificationHistory || [];
    payment.paymentVerificationHistory.push({
      action: 'verified',
      status: 'verified',
      performedBy: req.user._id,
      timestamp: now,
      note: finalNote,
    });
    await payment.save();
  }

  // Dispatch non-blocking confirmation email
  if (order.customer) {
    emailService.sendPaymentVerification(
      payment || { transactionId: order._id, amount: order.totals?.grandTotal || 0, paymentType: 'order', referenceId: order._id },
      order.customer,
      'verified',
      finalNote
    ).catch((err) =>
      logger.error(`[Email] Failed to dispatch payment verification approval email for #${order._id}: ${err.message}`)
    );
  }

  res.status(200).json(
    new ApiResponse(200, { order, payment }, 'Manual UPI payment successfully verified. Order confirmed.')
  );
});

/**
 * Admin rejects manual UPI payment for an order.
 * Transitions paymentStatus to 'rejected' and orderStatus to 'payment_failed'.
 * Records rejecting admin, timestamp, and audit review note.
 * Endpoint: PATCH /api/v1/admin/orders/:orderId/payment/reject
 * Access: Admin Only
 */
export const rejectOrderPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { note, reviewNote } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return next(new AppError('Invalid order identifier format.', 400));
  }

  const order = await Order.findById(orderId).populate('customer', 'name email');
  if (!order) {
    return next(new AppError('Target order not found.', 404));
  }

  const finalNote = (note || reviewNote || 'Payment rejected: transaction not found in bank records').trim();
  const now = new Date();

  order.paymentStatus = 'rejected';
  order.orderStatus = 'payment_failed';
  order.paymentRejectedBy = req.user._id;
  order.paymentRejectedAt = now;
  order.paymentReviewNote = finalNote;
  order.paymentVerificationHistory = order.paymentVerificationHistory || [];
  order.paymentVerificationHistory.push({
    action: 'rejected',
    status: 'rejected',
    performedBy: req.user._id,
    timestamp: now,
    note: finalNote,
  });
  await order.save();

  // Find and update matching Payment record
  let payment = await Payment.findOne({ referenceId: order._id, paymentType: 'order' });
  if (payment) {
    payment.status = 'rejected';
    payment.paymentRejectedBy = req.user._id;
    payment.paymentRejectedAt = now;
    payment.paymentReviewNote = finalNote;
    payment.paymentVerificationHistory = payment.paymentVerificationHistory || [];
    payment.paymentVerificationHistory.push({
      action: 'rejected',
      status: 'rejected',
      performedBy: req.user._id,
      timestamp: now,
      note: finalNote,
    });
    await payment.save();
  }

  // Dispatch non-blocking rejection email
  if (order.customer) {
    emailService.sendPaymentVerification(
      payment || { transactionId: order._id, amount: order.totals?.grandTotal || 0, paymentType: 'order', referenceId: order._id },
      order.customer,
      'rejected',
      finalNote
    ).catch((err) =>
      logger.error(`[Email] Failed to dispatch payment rejection email for #${order._id}: ${err.message}`)
    );
  }

  res.status(200).json(
    new ApiResponse(200, { order, payment }, 'Manual UPI payment rejected. Customer notified.')
  );
});

/**
 * Handles verifying QR transfer receipt checks by payment ID. Updates order/payment statuses.
 * Compatible with AdminPayments UI.
 * Endpoint: PUT /api/v1/admin/payments/verify/:paymentId
 * Access: Admin Only
 */
export const verifyPaymentProof = asyncHandler(async (req, res, next) => {
  const { paymentId } = req.params;
  const { action, note, reviewNote } = req.body; // 'approve' or 'reject'

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return next(new AppError('Invalid payment identifier format.', 400));
  }

  if (!action || !['approve', 'verify', 'reject'].includes(action)) {
    return next(new AppError('Please supply verification outcome action (approve or reject)', 400));
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return next(new AppError('Payment transaction audit not found.', 404));
  }

  const user = await User.findById(payment.customer);
  const now = new Date();
  const isApproval = action === 'approve' || action === 'verify';
  const finalNote = (note || reviewNote || (isApproval ? 'Payment verified via manual UPI bank records' : 'Payment rejected: transaction not found in bank records')).trim();

  // Prevent double approval
  if (isApproval && (payment.status === 'verified' || payment.status === 'succeeded')) {
    return next(new AppError('This payment has already been verified.', 400));
  }

  if (isApproval) {
    // Check if associated order is cancelled
    if (payment.paymentType === 'order') {
      const order = await Order.findById(payment.referenceId);
      if (order && order.orderStatus === 'cancelled') {
        return next(new AppError('Cannot verify payment for a cancelled order.', 400));
      }
      if (order) {
        order.paymentStatus = 'verified';
        order.orderStatus = 'confirmed';
        order.paymentVerifiedBy = req.user._id;
        order.paymentVerifiedAt = now;
        order.paymentReviewNote = finalNote;
        order.paymentVerificationHistory = order.paymentVerificationHistory || [];
        order.paymentVerificationHistory.push({
          action: 'verified',
          status: 'verified',
          performedBy: req.user._id,
          timestamp: now,
          note: finalNote,
        });
        await order.save();
      }
    } else if (payment.paymentType === 'booking') {
      const booking = await Booking.findById(payment.referenceId);
      if (booking) {
        booking.paymentStatus = 'paid';
        await booking.save();
      }
    }

    payment.status = 'verified';
    payment.paymentVerifiedBy = req.user._id;
    payment.paymentVerifiedAt = now;
    payment.paymentReviewNote = finalNote;
    payment.paymentVerificationHistory = payment.paymentVerificationHistory || [];
    payment.paymentVerificationHistory.push({
      action: 'verified',
      status: 'verified',
      performedBy: req.user._id,
      timestamp: now,
      note: finalNote,
    });
    await payment.save();

    if (user) {
      emailService.sendPaymentVerification(payment, user, 'verified', finalNote).catch((err) =>
        logger.error(`[Email] Failed to dispatch verification approval email: ${err.message}`)
      );
    }

    return res.status(200).json(
      new ApiResponse(200, payment, 'QR Payment receipt APPROVED. Customer notified.')
    );
  } else {
    // Rejection
    if (payment.paymentType === 'order') {
      const order = await Order.findById(payment.referenceId);
      if (order) {
        order.paymentStatus = 'rejected';
        order.orderStatus = 'payment_failed';
        order.paymentRejectedBy = req.user._id;
        order.paymentRejectedAt = now;
        order.paymentReviewNote = finalNote;
        order.paymentVerificationHistory = order.paymentVerificationHistory || [];
        order.paymentVerificationHistory.push({
          action: 'rejected',
          status: 'rejected',
          performedBy: req.user._id,
          timestamp: now,
          note: finalNote,
        });
        await order.save();
      }
    }

    payment.status = 'rejected';
    payment.paymentRejectedBy = req.user._id;
    payment.paymentRejectedAt = now;
    payment.paymentReviewNote = finalNote;
    payment.paymentVerificationHistory = payment.paymentVerificationHistory || [];
    payment.paymentVerificationHistory.push({
      action: 'rejected',
      status: 'rejected',
      performedBy: req.user._id,
      timestamp: now,
      note: finalNote,
    });
    await payment.save();

    if (user) {
      emailService.sendPaymentVerification(payment, user, 'rejected', finalNote).catch((err) =>
        logger.error(`[Email] Failed to dispatch verification rejection email: ${err.message}`)
      );
    }

    return res.status(200).json(
      new ApiResponse(200, payment, 'QR Payment proof receipt REJECTED. Alert email spooled.')
    );
  }
});

