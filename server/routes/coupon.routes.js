import express from 'express';
import { validateCoupon, getActiveCoupons } from '../controllers/coupon.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public active coupon browsing
router.get('/', getActiveCoupons);

// Validate coupon route (requires active authentication context)
router.post('/validate', protect, validateCoupon);

export default router;

