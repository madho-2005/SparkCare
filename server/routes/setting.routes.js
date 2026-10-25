import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', protect, restrictTo('admin'), updateSettings);

export default router;
