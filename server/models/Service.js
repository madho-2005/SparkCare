import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a service title'],
      unique: true,
      trim: true,
      maxlength: [80, 'Service title cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a service description'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a service category'],
      trim: true,
      index: true, // Filters by wiring, installation, repair
    },
    basePrice: {
      type: Number,
      required: [true, 'Please specify base service cost estimate'],
      min: [0, 'Base price cannot be negative'],
    },
    estimatedMinutes: {
      type: Number,
      required: [true, 'Please specify estimated duration in minutes'],
      min: [1, 'Estimated duration must be at least 1 minute'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['basic', 'standard', 'complex'],
        message: 'Invalid difficulty rating: choose basic, standard, or complex',
      },
      default: 'standard',
    },
    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
serviceSchema.index({ category: 1, basePrice: 1 });
serviceSchema.index({ title: 'text', description: 'text' });

// Middleware: Auto-slug generation from title
serviceSchema.pre('save', function (next) {
  if (!this.isModified('title')) return next();
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

export const Service = mongoose.model('Service', serviceSchema);
