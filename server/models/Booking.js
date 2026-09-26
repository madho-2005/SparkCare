import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking customer reference is required'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Booking service reference is required'],
    },
    bookingStatus: {
      type: String,
      enum: {
        values: [
          'scheduled',          // Appointment confirmed, date locked in
          'in_transit',         // Service team traveling to client address
          'in_progress',        // Service active at the address
          'completed',          // Job successfully completed
          'cancelled'           // Reservation cancelled
        ],
        message: 'Invalid booking status',
      },
      default: 'scheduled',
      index: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please specify scheduled date'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a timeslot'],
      enum: {
        values: [
          '08:00 - 11:00',
          '11:00 - 14:00',
          '14:00 - 17:00',
          '17:00 - 20:00'
        ],
        message: 'Invalid time window selection',
      },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    basePrice: {
      type: Number,
      min: [0, 'Base price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    totalPrice: {
      type: Number,
      required: [true, 'Booking total price is required'],
      min: [0, 'Price cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed indices for calendars and admin analytics
bookingSchema.index({ customer: 1, scheduledDate: -1 });
bookingSchema.index({ paymentStatus: 1, scheduledDate: -1 });
bookingSchema.index({ bookingStatus: 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
