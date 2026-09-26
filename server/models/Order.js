import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Item product reference is required'],
  },
  name: {
    type: String,
  },
  sku: {
    type: String,
  },
  image: {
    type: String,
  },
  quantity: {
    type: Number,
    required: [true, 'Item quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Item unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order customer is required'],
      index: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'cod', 'qr'],
      default: 'stripe',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'proof_submitted', 'under_review', 'paid', 'verified', 'rejected', 'failed', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['placed', 'awaiting_payment_verification', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'],
      default: 'placed',
      index: true,
    },
    totals: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, required: true, default: 0, min: 0 },
      discount: { type: Number, required: true, default: 0, min: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    trackingId: {
      type: String,
      trim: true,
    },
    deliveredAt: {
      type: Date,
    },
    stockRestored: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Manual UPI Payment Verification Audit Metadata
    paymentProofUrl: {
      type: String,
    },
    paymentProofPublicId: {
      type: String,
    },
    paymentProofUploadedAt: {
      type: Date,
    },
    paymentProofSubmittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentVerifiedAt: {
      type: Date,
    },
    paymentRejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    paymentRejectedAt: {
      type: Date,
    },
    paymentReviewNote: {
      type: String,
      trim: true,
    },
    paymentVerificationHistory: [
      {
        action: {
          type: String,
          enum: ['submitted', 'verified', 'rejected', 'resubmitted'],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }

);

// High-speed indices for admin analytics and client listings
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
