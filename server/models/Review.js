import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true, // Ties a service review to an authenticated completed booking
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true, // Ties a product review to an authenticated delivered order
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
      index: true, // Server-asserted flag indicating purchase verification
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment cannot be empty'],
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from submitting duplicate reviews for the same product or service instance
reviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, service: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, order: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, booking: 1, service: 1 }, { unique: true, sparse: true });

/**
 * Static schema method: Aggregates and updates average ratings of target Product or Service.
 * Implements high-speed Mongo aggregate pipeline.
 */
reviewSchema.statics.calculateAverageRating = async function (targetId, modelType) {
  const stats = await this.aggregate([
    {
      $match: { [modelType]: new mongoose.Types.ObjectId(targetId) },
    },
    {
      $group: {
        _id: `$${modelType}`,
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const targetModel = mongoose.model(modelType === 'product' ? 'Product' : 'Service');

  try {
    if (stats.length > 0) {
      await targetModel.findByIdAndUpdate(targetId, {
        numReviews: stats[0].nRating,
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
      });
    } else {
      await targetModel.findByIdAndUpdate(targetId, {
        numReviews: 0,
        averageRating: 0,
      });
    }
  } catch (error) {
    logger.error(`Failed to aggregate ratings for ${modelType} (${targetId}): ${error.message}`);
  }
};

// Post-save hooks: Recalculate averages when reviews are added
reviewSchema.post('save', async function () {
  if (this.product) {
    await this.constructor.calculateAverageRating(this.product, 'product');
  }
  if (this.service) {
    await this.constructor.calculateAverageRating(this.service, 'service');
  }
});

// Post-remove/delete hooks: Recalculate averages when reviews are removed
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    if (doc.product) {
      await doc.constructor.calculateAverageRating(doc.product, 'product');
    }
    if (doc.service) {
      await doc.constructor.calculateAverageRating(doc.service, 'service');
    }
  }
});

export const Review = mongoose.model('Review', reviewSchema);
