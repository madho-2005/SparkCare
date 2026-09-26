import express from 'express';
import { 
  addProductReview, 
  getProductReviews,
  addServiceReview,
  getServiceReviews,
  getLatestReviews,
  deleteReview 
} from '../controllers/review.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public global routes
router.get('/latest', getLatestReviews);
router.get('/products/:productId', getProductReviews);
router.get('/services/:serviceId', getServiceReviews);

// Protected client review submissions
router.post('/products/:productId', protect, addProductReview);
router.post('/services/:serviceId', protect, addServiceReview);

// Protected review delete action (Author or Admin Only)
router.delete('/:id', protect, deleteReview);

export default router;
