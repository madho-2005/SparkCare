import { Service } from '../models/Service.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

// High-fidelity seed services for SparkCare
const SEED_SERVICES = [
  {
    title: 'Ceiling Fan Installation & Setup',
    description: 'Expert assembly, mounting, wiring, and balancing of ceiling fans. Includes safe testing and switch alignment.',
    category: 'Installation',
    basePrice: 120,
    estimatedMinutes: 60,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/ceiling-fan.png',
      public_id: 'seed/ceiling-fan'
    }]
  },
  {
    title: 'Smart Panel Upgrade (200 Amp)',
    description: 'Replace obsolete or dangerous fuse boxes/panels with state-of-the-art breaker systems featuring remote mobile tracking.',
    category: 'Wiring',
    basePrice: 499,
    estimatedMinutes: 240,
    difficulty: 'complex',
    images: [{
      secure_url: '/images/services/smart-panel.png',
      public_id: 'seed/smart-panel'
    }]
  },
  {
    title: 'EV Fast Charger Installation',
    description: 'Premium circuit setup and hardware mounting of high-power Level 2 electric vehicle chargers in residential garages.',
    category: 'Installation',
    basePrice: 299,
    estimatedMinutes: 120,
    difficulty: 'complex',
    images: [{
      secure_url: '/images/services/ev-charger.png',
      public_id: 'seed/ev-charger'
    }]
  },
  {
    title: 'Faulty Wiring Diagnosis & Repair',
    description: 'Full inspection of dead outlets, burning odors, flickering bulbs, and tripping breakers to ensure home safety.',
    category: 'Repair',
    basePrice: 95,
    estimatedMinutes: 90,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/wiring-repair.png',
      public_id: 'seed/wiring-repair'
    }]
  },
  {
    title: 'LED Recessed Lighting Setup',
    description: 'Layout and installation of modern, ultra-slim recessed LED downlights with dimmable switches for a sleek environment.',
    category: 'Installation',
    basePrice: 180,
    estimatedMinutes: 150,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/led-lighting.png',
      public_id: 'seed/led-lighting'
    }]
  },
  {
    title: 'Smart Thermostat Integration',
    description: 'Secure installation and software integration of Nest, Ecobee, or Honeywell smart units with home network syncing.',
    category: 'Installation',
    basePrice: 85,
    estimatedMinutes: 45,
    difficulty: 'basic',
    images: [{
      secure_url: '/images/services/thermostat.png',
      public_id: 'seed/thermostat'
    }]
  },
  {
    title: 'Outdoor Flood & Security Lighting',
    description: 'Weatherproof LED floodlights, motion sensors, and smart dusk-to-dawn controllers for perimeter protection.',
    category: 'Installation',
    basePrice: 210,
    estimatedMinutes: 90,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/outdoor-lighting.png',
      public_id: 'seed/outdoor-lighting'
    }]
  },
  {
    title: 'Electrical Safety Inspection',
    description: 'Comprehensive NFPA-compliant home audit covering outlets, grounding, panel load analysis, and AFCI protection.',
    category: 'Inspection',
    basePrice: 75,
    estimatedMinutes: 75,
    difficulty: 'basic',
    images: [{
      secure_url: '/images/services/safety-inspection.png',
      public_id: 'seed/safety-inspection'
    }]
  },
  {
    title: 'Whole-Home Surge Protection',
    description: 'Install whole-panel surge protectors to shield appliances, electronics, and HVAC from voltage spikes.',
    category: 'Wiring',
    basePrice: 185,
    estimatedMinutes: 60,
    difficulty: 'standard',
    images: [{
      secure_url: '/images/services/surge-protection.png',
      public_id: 'seed/surge-protection'
    }]
  }
];

// Helper to auto seed services
const autoSeedServices = async () => {
  try {
    const count = await Service.countDocuments();
    if (count === 0) {
      logger.info('Service inventory empty. Automatic seeding initiated...');
      await Service.insertMany(SEED_SERVICES);
      logger.info('Service catalog pre-seeded successfully.');
    } else {
      // Sync image URLs for existing seed services if needed
      for (const item of SEED_SERVICES) {
        await Service.updateOne(
          { title: item.title },
          { $set: { images: item.images } }
        );
      }
    }
  } catch (error) {
    logger.error('Failed to auto-seed services catalog:', error);
  }
};

// Utility helper to safely escape regex special characters
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Get all services (supports filtering by category, difficulty, search).
 */
export const getServices = asyncHandler(async (req, res, next) => {
  await autoSeedServices();

  const { search, category, difficulty } = req.query;

  const queryObj = { isActive: true };

  if (category && typeof category === 'string' && category !== 'All') {
    queryObj.category = category.trim();
  }

  if (difficulty && typeof difficulty === 'string' && ['basic', 'standard', 'complex'].includes(difficulty)) {
    queryObj.difficulty = difficulty;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const cleanSearch = escapeRegex(search.trim().slice(0, 100));
    queryObj.$or = [
      { title: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      { category: { $regex: cleanSearch, $options: 'i' } }
    ];
  }

  const services = await Service.find(queryObj).sort({ createdAt: -1 });

  // Map to include durationEstimateMinutes to match client pages expectations
  const mappedServices = services.map(s => {
    const obj = s.toObject();
    obj.durationEstimateMinutes = s.estimatedMinutes;
    return obj;
  });

  ApiResponse.send(res, 200, mappedServices, 'Services retrieved successfully.');
});

/**
 * Get service by ID.
 */
export const getServiceById = asyncHandler(async (req, res, next) => {
  await autoSeedServices();
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid service identifier format.', 400));
  }

  const service = await Service.findById(id);
  if (!service || !service.isActive) {
    return next(new AppError('Service not found or inactive.', 404));
  }

  const obj = service.toObject();
  obj.durationEstimateMinutes = service.estimatedMinutes;

  ApiResponse.send(res, 200, obj, 'Service details retrieved successfully.');
});

/**
 * Admin: Create new Service.
 */
export const createService = asyncHandler(async (req, res, next) => {
  const { title, description, category, basePrice, estimatedMinutes, difficulty, images } = req.body;

  if (!title || !description || !category || !basePrice || !estimatedMinutes) {
    return next(new AppError('Please supply all required service parameters.', 400));
  }

  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  const existing = await Service.findOne({ title: cleanTitle });
  if (existing) {
    return next(new AppError('A service with this title already exists.', 400));
  }

  const service = await Service.create({
    title: cleanTitle,
    description: typeof description === 'string' ? description.trim() : '',
    category: typeof category === 'string' ? category.trim() : '',
    basePrice: Number(basePrice),
    estimatedMinutes: Number(estimatedMinutes),
    difficulty: difficulty || 'standard',
    images: Array.isArray(images) ? images : []
  });

  const obj = service.toObject();
  obj.durationEstimateMinutes = service.estimatedMinutes;

  ApiResponse.send(res, 201, obj, 'Service created successfully.');
});

/**
 * Admin: Update existing Service.
 * Uses strict allowlist to prevent arbitrary updates or operator injection.
 */
export const updateService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid service identifier format.', 400));
  }

  const { title, description, category, basePrice, estimatedMinutes, difficulty, images, isActive } = req.body;

  const updatePayload = {};
  if (title !== undefined && typeof title === 'string') updatePayload.title = title.trim();
  if (description !== undefined && typeof description === 'string') updatePayload.description = description.trim();
  if (category !== undefined && typeof category === 'string') updatePayload.category = category.trim();
  if (basePrice !== undefined) {
    const bp = Number(basePrice);
    if (isNaN(bp) || bp < 0) return next(new AppError('Base price must be a valid positive number.', 400));
    updatePayload.basePrice = bp;
  }
  if (estimatedMinutes !== undefined) {
    const em = parseInt(estimatedMinutes, 10);
    if (isNaN(em) || em < 0) return next(new AppError('Estimated minutes must be a valid positive integer.', 400));
    updatePayload.estimatedMinutes = em;
  }
  if (difficulty !== undefined && ['basic', 'standard', 'complex'].includes(difficulty)) {
    updatePayload.difficulty = difficulty;
  }
  if (Array.isArray(images)) {
    updatePayload.images = images;
  }
  if (isActive !== undefined) {
    updatePayload.isActive = Boolean(isActive);
  }

  const service = await Service.findByIdAndUpdate(id, { $set: updatePayload }, {
    new: true,
    runValidators: true
  });

  if (!service) {
    return next(new AppError('Service not found.', 404));
  }

  const obj = service.toObject();
  obj.durationEstimateMinutes = service.estimatedMinutes;

  ApiResponse.send(res, 200, obj, 'Service updated successfully.');
});

/**
 * Admin: Delete/Deactivate Service.
 */
export const deleteService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const service = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!service) {
    return next(new AppError('Service not found.', 404));
  }

  ApiResponse.send(res, 200, null, 'Service deactivated successfully.');
});
