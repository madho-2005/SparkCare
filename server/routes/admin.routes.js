import express from 'express';
import {
  getDashboardStats,

  getAdminReports,
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminUsers,
  updateUserRole,
  getAdminOrders,
  updateOrderStatus,
  getPendingQrPayments,
  getOrdersPaymentPending,
  verifyOrderPayment,
  rejectOrderPayment,
  verifyPaymentProof
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { adminStatsRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Enforce strict administrative controls globally across these endpoints
router.use(protect, restrictTo('admin'));

// Overview Stats & Reports (Rate-limited to prevent memory exhaustion / DoS)
router.get('/stats', adminStatsRateLimiter, getDashboardStats);
router.get('/reports', adminStatsRateLimiter, getAdminReports);


// Coupons CRUD Controls
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.patch('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

// User Directory & Role Mutations
router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);

// General Orders Audit & Progress Toggles
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Manual UPI QR proof verification streams
router.get('/payments/pending', getPendingQrPayments);
router.get('/orders/payment-pending', getOrdersPaymentPending);
router.patch('/orders/:orderId/payment/verify', verifyOrderPayment);
router.put('/orders/:orderId/payment/verify', verifyOrderPayment);
router.patch('/orders/:orderId/payment/reject', rejectOrderPayment);
router.put('/orders/:orderId/payment/reject', rejectOrderPayment);
router.put('/payments/verify/:paymentId', verifyPaymentProof);

export default router;

