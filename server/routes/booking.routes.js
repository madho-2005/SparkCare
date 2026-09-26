import express from 'express';
import {
  createBooking,
  getBookings,
  updateBookingStatus,
  cancelBooking
} from '../controllers/booking.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Enforce authentication globally for all booking actions
router.use(protect);

// Customer booking routes
router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id/cancel', cancelBooking);

// Admin status management route
router.patch('/:id/status', restrictTo('admin'), updateBookingStatus);

export default router;
