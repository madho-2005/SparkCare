import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      validate: {
        validator: function (val) {
          // 'this' refers to current doc; only works on initial document creation
          return !val || val > this.price;
        },
        message: 'Compare-at-price ({VALUE}) must be greater than standard price',
      },
    },
    sku: {
      type: String,
      required: [true, 'Please provide a product SKU'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Please specify product brand/manufacturer'],
      trim: true,
    },
    stockCount: {
      type: Number,
      required: [true, 'Please specify product stock quantity'],
      min: [0, 'Stock count cannot be negative'],
      default: 0,
    },
    images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10, // Round to nearest 1 decimal
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive'],
      default: 'active',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimization
productSchema.index({ category: 1, price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1, status: 1 });

// Full-text search index for catalog searchability
productSchema.index(
  { name: 'text', description: 'text', brand: 'text' },
  { weights: { name: 10, brand: 5, description: 1 } }
);

// Virtual: Dynamic calculation of discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Middleware: Auto-slug generation from name
productSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  next();
});

export const Product = mongoose.model('Product', productSchema);
