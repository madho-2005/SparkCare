import express from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { addServiceReview } from '../controllers/review.controller.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Verified Client Review alias route
router.post('/:serviceId/reviews', protect, addServiceReview);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), createService);
router.put('/:id', protect, restrictTo('admin'), updateService);
router.delete('/:id', protect, restrictTo('admin'), deleteService);

export default router;
