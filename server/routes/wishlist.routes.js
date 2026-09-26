import express from 'express';
import { getWishlist, toggleWishlistProduct } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All wishlist endpoints are protected
router.use(protect);

router.get('/', getWishlist);
router.post('/toggle/:productId', toggleWishlistProduct);

export default router;
