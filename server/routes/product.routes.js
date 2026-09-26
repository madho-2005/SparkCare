import express from 'express';
import { 
  getProducts, 
  getProductCategories, 
  getProductById, 
  adminGetProducts,
  createProduct, 
  updateProduct, 
  toggleProductStatus,
  deleteProduct,
  deleteProductImage
} from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { upload, verifyImageBuffer } from '../middleware/upload.middleware.js';
import { addProductReview } from '../controllers/review.controller.js';

const router = express.Router();

// Admin-specific inventory endpoint (placed before /:id)
router.get('/admin/all', protect, restrictTo('admin'), adminGetProducts);

// Public routes
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/:id', getProductById);

// Verified Customer Review alias route
router.post('/:productId/reviews', protect, addProductReview);

// Admin-only Mutation routes
router.post('/', protect, restrictTo('admin'), upload.array('images', 5), verifyImageBuffer, createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.array('images', 5), verifyImageBuffer, updateProduct);
router.patch('/:id/status', protect, restrictTo('admin'), toggleProductStatus);
router.delete('/:id/images/:publicId', protect, restrictTo('admin'), deleteProductImage);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

export default router;
