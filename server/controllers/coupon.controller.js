import { Coupon } from '../models/Coupon.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Validates a coupon code against a cart subtotal.
 * Endpoint: POST /api/v1/coupons/validate
 * Access: Protected
 */
export const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return next(new AppError('Please provide a coupon code to validate', 400));
  }

  if (typeof subtotal !== 'number' || subtotal <= 0) {
    return next(new AppError('Invalid cart subtotal provided', 400));
  }

  // Find active and published coupon
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
    isPublished: true,
  });

  if (!coupon) {
    return next(new AppError('Invalid coupon code or coupon is inactive', 404));
  }

  // Check if coupon start date is in the future
  if (coupon.startsAt && new Date() < new Date(coupon.startsAt)) {
    return next(new AppError('This promotional coupon is not yet active', 400));
  }

  // Check if coupon is expired
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
    return next(new AppError('This coupon has expired', 400));
  }

  // Check minimum purchase amount
  if (subtotal < coupon.minPurchaseAmount) {
    return next(
      new AppError(
        `Minimum spend of ₹${coupon.minPurchaseAmount} is required to apply this coupon. Your subtotal is ₹${subtotal}`,
        400
      )
    );
  }

  // Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return next(new AppError('This coupon usage limit has been reached', 400));
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed_amount') {
    discountAmount = coupon.discountValue;
  }

  // Prevent discount from exceeding total cost
  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = subtotal - discountAmount;

  res.status(200).json(
    new ApiResponse(200, {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Number(discountAmount.toFixed(2)),
      finalTotal: Number(finalTotal.toFixed(2)),
    }, 'Coupon validated successfully')
  );
});

/**
 * Retrieves list of active, unexpired, published coupons for user browsing.
 * Endpoint: GET /api/v1/coupons
 * Access: Public
 */
export const getActiveCoupons = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const coupons = await Coupon.find({
    isActive: true,
    isPublished: true,
    $or: [
      { startsAt: null },
      { startsAt: { $lte: now } },
    ],
    $and: [
      {
        $or: [
          { expiryDate: null },
          { expiryDate: { $gt: now } },
        ],
      },
    ],
  })
    .select('code discountType discountValue minPurchaseAmount maxDiscountAmount expiryDate startsAt usageLimit usedCount isActive isPublished description')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, coupons, 'Active promotion coupons loaded successfully')
  );
});

