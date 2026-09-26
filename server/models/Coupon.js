import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: ['percentage', 'fixed_amount'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number, // Caps maximum discount if using percentage type
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    startsAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    source: {
      type: String,
      enum: ['admin', 'system'],
      default: 'admin',
    },
    usageLimit: {
      type: Number,
      default: null, // Null means infinite uses allowed system-wide
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias for expiresAt
couponSchema.virtual('expiresAt').get(function () {
  return this.expiryDate;
});

/**
 * Instance method: Verifies coupon viability for a specific shopping cart subtotal.
 * Checks expiry, active flags, publication status, startsAt, usage limits, and minimum spending thresholds.
 * 
 * @param {Number} cartSubtotal - Cart subtotal amount before discount.
 * @returns {Boolean}
 */
couponSchema.methods.isValid = function (cartSubtotal) {
  if (!this.isActive || !this.isPublished) return false;
  if (this.startsAt && new Date() < new Date(this.startsAt)) return false;
  if (this.expiryDate && new Date() > new Date(this.expiryDate)) return false;
  if (cartSubtotal < this.minPurchaseAmount) return false;
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
  return true;
};

/**
 * Instance method: Calculates discount reduction for a shopping cart subtotal.
 * 
 * @param {Number} cartSubtotal - Cart subtotal amount.
 * @returns {Number} Discount amount.
 */
couponSchema.methods.calculateDiscount = function (cartSubtotal) {
  if (!this.isValid(cartSubtotal)) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (cartSubtotal * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.discountType === 'fixed_amount') {
    discount = this.discountValue;
  }

  // Prevent discount from exceeding total cost
  return Math.min(discount, cartSubtotal);
};

export const Coupon = mongoose.model('Coupon', couponSchema);

