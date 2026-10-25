import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    taxRate: {
      type: Number,
      default: 8,
      min: [0, 'Tax rate cannot be negative'],
    },
    freeShippingThreshold: {
      type: Number,
      default: 100,
      min: [0, 'Free shipping threshold cannot be negative'],
    },
    shippingFee: {
      type: Number,
      default: 10,
      min: [0, 'Shipping fee cannot be negative'],
    },
    supportPhone: {
      type: String,
      default: '+91 7984025080',
      trim: true,
    },
    supportEmail: {
      type: String,
      default: 'urvishthummar6@gmail.com',
      trim: true,
      lowercase: true,
    },
    upiId: {
      type: String,
      default: 'urvishthummar@okhdfcbank',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
