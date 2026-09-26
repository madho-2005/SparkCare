import express from 'express';
import { 
  createOrder, 
  submitQrPaymentProof, 
  getMyOrders, 
  getOrderById,
  cancelOrder
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload, verifyImageBuffer } from '../middleware/upload.middleware.js';

const router = express.Router();

// Apply global protection middleware since all order endpoints require authentication
router.use(protect);

// Main Order Actions
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

// QR Payment Screenshot Upload (takes 'screenshot' image field via Multer memory parsing)
router.post('/:orderId/pay-qr', upload.single('screenshot'), verifyImageBuffer, submitQrPaymentProof);

export default router;
