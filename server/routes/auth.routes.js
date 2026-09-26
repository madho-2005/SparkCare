import express from 'express';
import { register, login, logout, refresh, getMe, updateProfile } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validator.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validations/auth.validation.js';
import { loginRateLimiter, registerRateLimiter, refreshRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', registerRateLimiter, validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshRateLimiter, refresh);
router.get('/me', protect, getMe);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);

export default router;
