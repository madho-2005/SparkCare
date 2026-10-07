import { Booking } from '../models/Booking.js';
import { Service } from '../models/Service.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { notificationService } from '../services/notificationService.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Create a new service booking.
 * Calculates authoritative service price on the server.
 * Completely ignores client-supplied price or total values to prevent tampering.
 * Endpoint: POST /api/v1/bookings
 * Access: Private (Authenticated Users)
 */
export const createBooking = asyncHandler(async (req, res, next) => {
  const { serviceId, scheduledDate, timeSlot, address, notes, couponCode } = req.body;

  if (!serviceId || !scheduledDate || !address) {
    return next(new AppError('Please supply all required booking parameters (serviceId, scheduledDate, address).', 400));
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return next(new AppError('Invalid service identifier format.', 400));
  }

  // 1. Fetch authoritative service document from MongoDB
  const serviceObj = await Service.findById(serviceId);
  if (!serviceObj) {
    return next(new AppError('Service not found.', 404));
  }

  if (serviceObj.isActive === false) {
    return next(new AppError('This service is currently not available for booking.', 400));
  }

  // 2. Authoritative base price strictly from database
  const basePrice = Number(serviceObj.basePrice);
  if (isNaN(basePrice) || basePrice < 0) {
    return next(new AppError('Internal service pricing configuration error.', 500));
  }

  // 3. Process optional coupon discount on the server
  let discount = 0;
  let couponRef = null;

  if (couponCode && typeof couponCode === 'string') {
    const coupon = await Coupon.findOne({
      code: couponCode.trim().toUpperCase(),
      isActive: true,
      isPublished: true,
    });

    if (coupon) {
      const isNotStarted = coupon.startsAt && new Date() < new Date(coupon.startsAt);
      const isExpired = coupon.expiryDate && new Date() > new Date(coupon.expiryDate);
      const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
      const isMinPurchaseMet = basePrice >= coupon.minPurchaseAmount;

      if (!isNotStarted && !isExpired && !isLimitReached && isMinPurchaseMet) {
        if (coupon.discountType === 'percentage') {
          discount = (basePrice * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
          }
        } else if (coupon.discountType === 'fixed_amount') {
          discount = coupon.discountValue;
        }

        discount = Math.min(discount, basePrice);
        couponRef = coupon._id;

        // Increment coupon usage count
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  // 4. Calculate authoritative final price (client totalPrice in req.body is NEVER used)
  const finalTotalPrice = Math.max(0, Number((basePrice - discount).toFixed(2)));

  // Security telemetry log if client attempted price modification
  if (req.body.totalPrice !== undefined && Number(req.body.totalPrice) !== finalTotalPrice) {
    logger.warn(
      `[Security Audit] Client submitted totalPrice (${req.body.totalPrice}) does not match authoritative calculated price (${finalTotalPrice}). Enforcing server calculation for user ${req.user._id}.`
    );
  }

  // Validate scheduled date
  const bookingDate = new Date(scheduledDate);
  if (isNaN(bookingDate.getTime())) {
    return next(new AppError('Invalid scheduled date provided.', 400));
  }

  // Allowed time slots validation
  const allowedSlots = ['08:00 - 11:00', '11:00 - 14:00', '14:00 - 17:00', '17:00 - 20:00'];
  const finalTimeSlot = allowedSlots.includes(timeSlot) ? timeSlot : '11:00 - 14:00';

  // 5. Build Booking structure with snapshot of pricing
  const booking = await Booking.create({
    customer: req.user._id,
    service: serviceId,
    scheduledDate: bookingDate,
    timeSlot: finalTimeSlot,
    address,
    basePrice,
    discount,
    coupon: couponRef,
    totalPrice: finalTotalPrice,
    notes: typeof notes === 'string' ? notes.trim() : '',
    bookingStatus: 'scheduled',
    paymentStatus: 'unpaid',
  });

  // 6. Automatically spawn corresponding pending Payment entry with authoritative total
  const transactionId = `TXN-BK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  await Payment.create({
    transactionId,
    amount: finalTotalPrice,
    currency: 'USD',
    gateway: 'cod',
    status: 'pending',
    paymentType: 'booking',
    referenceId: booking._id,
    paymentTypeModel: 'Booking',
    customer: req.user._id,
  });

  const populated = await Booking.findById(booking._id)
    .populate('customer', 'name email phoneNumber')
    .populate('service', 'title images category basePrice');

  // Dispatch non-blocking confirmation notification
  notificationService.sendBookingConfirmation(booking._id, req.user).catch((err) =>
    logger.error(`[Email] Failed to dispatch booking confirmation email for #${booking._id}: ${err.message}`)
  );

  ApiResponse.send(res, 201, populated, 'Booking request registered successfully.');
});

/**
 * Get bookings list (Role-based filtering).
 * Endpoint: GET /api/v1/bookings
 * Access: Private (Authenticated Users, Admin)
 */
export const getBookings = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.user.role === 'admin') {
    // Admins see all bookings
    filter = {};
  } else {
    // Regular clients query their own logs only
    filter.customer = req.user._id;
  }

  const bookings = await Booking.find(filter)
    .populate('customer', 'name email phoneNumber')
    .populate('service', 'title images category basePrice')
    .sort({ scheduledDate: 1 }); // near-term dates first

  ApiResponse.send(res, 200, bookings, 'Bookings loaded successfully.');
});

/**
 * Update Booking status.
 * Endpoint: PATCH /api/v1/bookings/:id/status
 * Access: Private (Admin Only)
 */
export const updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['scheduled', 'in_transit', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid booking status provided.', 400));
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  const previousStatus = booking.bookingStatus;
  booking.bookingStatus = status;
  if (status === 'completed') {
    booking.completedAt = new Date();
    booking.paymentStatus = 'paid'; // mark paid on job completion for COD/onsite cash
    
    // Sync payment records
    await Payment.findOneAndUpdate(
      { referenceId: booking._id, paymentType: 'booking' },
      { status: 'succeeded' }
    );
  }

  await booking.save();

  // Send status change notification only when status genuinely changed
  if (previousStatus !== status) {
    notificationService.sendBookingStatusUpdate(booking._id, status, previousStatus).catch((err) =>
      logger.error(`[Email] Failed to dispatch booking status update email for #${booking._id}: ${err.message}`)
    );
  }

  const populated = await Booking.findById(booking._id)
    .populate('customer', 'name email phoneNumber')
    .populate('service', 'title images category basePrice');

  ApiResponse.send(res, 200, populated, `Booking status successfully changed to: ${status}`);
});

/**
 * Cancel a service booking.
 * Endpoint: PATCH /api/v1/bookings/:id/cancel
 * Access: Private (Customer or Admin)
 */
export const cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found.', 404));
  }

  // Authorization check
  if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Unauthorized to cancel this booking.', 403));
  }

  // Status check: allow cancellation only if not in progress or completed
  if (['in_progress', 'completed'].includes(booking.bookingStatus)) {
    return next(new AppError(`Cannot cancel booking once status is "${booking.bookingStatus}". Please contact support.`, 400));
  }

  const previousStatus = booking.bookingStatus;
  booking.bookingStatus = 'cancelled';
  await booking.save();

  // Cancel associated payment if present
  await Payment.findOneAndUpdate(
    { referenceId: booking._id, paymentType: 'booking' },
    { status: 'failed' }
  );

  // Send status change notification
  if (previousStatus !== 'cancelled') {
    notificationService.sendBookingStatusUpdate(booking._id, 'cancelled', previousStatus).catch((err) =>
      logger.error(`[Email] Failed to dispatch booking cancellation email for #${booking._id}: ${err.message}`)
    );
  }

  const populated = await Booking.findById(booking._id)
    .populate('customer', 'name email phoneNumber')
    .populate('service', 'title images category basePrice');

  ApiResponse.send(res, 200, populated, 'Booking has been cancelled successfully.');
});

