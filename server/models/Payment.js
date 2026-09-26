import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    currency: {
      type: String,
      required: true,
      default: 'usd',
      uppercase: true,
    },
    gateway: {
      type: String,
      required: true,
      enum: ['stripe', 'cod', 'qr'],
      default: 'stripe',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'proof_submitted', 'under_review', 'verified', 'succeeded', 'rejected', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentType: {
      type: String,
      required: true,
      enum: ['order', 'booking'],
      index: true, // Identifies if this is for product delivery or service electrician visits
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Payment target reference is required'],
      refPath: 'paymentTypeModel', // Dynamically populates either Order or Booking
    },
    paymentTypeModel: {
      type: String,
      required: true,
      enum: ['Order', 'Booking'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment customer reference is required'],
      index: true,
    },
    screenshot: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    // Explicit manual verification audit fields
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
    rawGatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Stores full webhook/API payload metadata for audits
    },
  },
  {
    timestamps: true,
  }

);

// High-speed indices for auditing logs
paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ gateway: 1, status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
