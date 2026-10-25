import { Setting } from '../models/Setting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/appError.js';

/**
 * Get current system settings.
 * Endpoint: GET /api/v1/settings
 * Access: Public
 */
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({
      taxRate: 8,
      freeShippingThreshold: 100,
      shippingFee: 10,
      supportPhone: '+91 7984025080',
      supportEmail: 'urvishthummar6@gmail.com',
      upiId: 'urvishthummar@okhdfcbank',
    });
  }

  return res.status(200).json(
    new ApiResponse(200, settings, 'System settings retrieved successfully')
  );
});

/**
 * Update system settings.
 * Endpoint: PUT /api/v1/settings
 * Access: Protected (Admin only)
 */
export const updateSettings = asyncHandler(async (req, res, next) => {
  const { taxRate, freeShippingThreshold, shippingFee, supportPhone, supportEmail, upiId } = req.body;

  if (
    (taxRate !== undefined && Number(taxRate) < 0) ||
    (freeShippingThreshold !== undefined && Number(freeShippingThreshold) < 0) ||
    (shippingFee !== undefined && Number(shippingFee) < 0)
  ) {
    return next(new AppError('Numerical variables must be positive numbers', 400));
  }

  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting();
  }

  if (taxRate !== undefined) settings.taxRate = Number(taxRate);
  if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
  if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
  if (supportPhone !== undefined) settings.supportPhone = supportPhone.trim();
  if (supportEmail !== undefined) settings.supportEmail = supportEmail.trim().toLowerCase();
  if (upiId !== undefined) settings.upiId = upiId.trim();

  await settings.save();

  return res.status(200).json(
    new ApiResponse(200, settings, 'Platform system settings updated successfully')
  );
});
