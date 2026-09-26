import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import reviewRoutes from './review.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';
import couponRoutes from './coupon.routes.js';
import serviceRoutes from './service.routes.js';
import bookingRoutes from './booking.routes.js';
import { ApiResponse } from '../utils/apiResponse.js';

import { checkHealth } from '../controllers/health.controller.js';

const router = express.Router();

// Health check endpoint (system liveness & database readiness)
router.get('/health', checkHealth);

// Mounted REST gateways
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/coupons', couponRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);

export default router;

