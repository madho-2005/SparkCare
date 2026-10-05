import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import { mongoSanitize } from './middleware/mongoSanitize.middleware.js';

import mongoose from 'mongoose';

// Configurations and database
import { connectDB } from './config/db.js';

// Middlewares
import { httpLogger } from './middleware/logger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';

// Routes & Controllers
import apiRoutes from './routes/index.js';
import { checkHealth } from './controllers/health.controller.js';

// Utilities
import { logger } from './utils/logger.js';
import { AppError } from './utils/appError.js';
import { validateEnv } from './utils/validateEnv.js';

// Load and validate environment configuration
dotenv.config();
validateEnv();

// Initialize Database connection pool
connectDB();

const app = express();

// Trust first proxy hop (e.g. Nginx, Cloudflare, AWS ALB) for accurate IP resolution in rate limiting
app.set('trust proxy', 1);

// ==========================================
// 1. Security Header Shielding (Helmet)
// ==========================================
app.use(helmet());

// ==========================================
// 2. Cross-Origin Resource Sharing (CORS)
// ==========================================
const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  
  const defaultLocalOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  return Array.from(new Set([...defaultLocalOrigins, ...envOrigins]));
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, health checks)
    if (!origin) return callback(null, true);

    const allowed = getAllowedOrigins();

    // 1. Direct match in configured allowed origins
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    // 2. Securely match Vercel production and preview deployment domains
    if (/^https:\/\/[a-zA-Z0-9-_.]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // 3. In non-production, allow any localhost / 127.0.0.1 port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    logger.warn(`[CORS Blocked] Origin "${origin}" is not authorized by CORS policy.`);
    return callback(new AppError(`Origin "${origin}" not allowed by CORS policy.`, 403));
  },
  credentials: true, // Support cookie transmissions
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// ==========================================
// 3. HTTP Request Parsers & Morgan Logger
// ==========================================
app.use(httpLogger);
app.use(express.json({ limit: '10mb' })); // Limits payload to mitigate overflow risks
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL Injection (MongoDB operator stripping) & HTTP Parameter Pollution guards
app.use(mongoSanitize);
app.use(hpp());

// ==========================================
// 4. DDoS & API Rate Limiting Guards
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 5000, // Generous threshold for SPA navigation & search
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests originating from this address. Please try again after 15 minutes.'
  }
});
app.use('/api/', apiLimiter);

// ==========================================
// 5. REST Gateways mounting
// ==========================================
app.use('/api/v1', apiRoutes);

// Root Welcome Gateway
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SparkCare API Server is live and operational.',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      products: '/api/v1/products',
      services: '/api/v1/services'
    }
  });
});

// Root Health Gateway (for ALB / Kubernetes / Docker health checks)
app.get('/health', checkHealth);

// Catch-all: Route matching failure
app.all('*', (req, res, next) => {
  next(new AppError(`The requested resource path (${req.originalUrl}) could not be found.`, 404));
});

// ==========================================
// 6. Centralized Error Formatting Pipe
// ==========================================
app.use(errorHandler);

// ==========================================
// 7. Engine Activation and Boot Listeners
// ==========================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`SparkCare Backend Active on Port: ${PORT} (Environment: ${process.env.NODE_ENV || 'development'})`);
});

// Graceful termination handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Initiating graceful termination sequence...`);
  server.close(async () => {
    logger.info('HTTP server closed. Draining database connection pools...');
    try {
      await mongoose.connection.close(false);
      logger.info('MongoDB connection pool safely closed. Exiting process.');
      process.exit(0);
    } catch (err) {
      logger.error('Error closing MongoDB connection pool during shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded. Forcefully terminating process.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Capture and resolve unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  logger.error('CRITICAL UNHANDLED REJECTION: Wiping connection pools and shutting down...');
  logger.error(err);
  
  server.close(() => {
    process.exit(1);
  });
});

// Capture unexpected synchronous bugs cleanly
process.on('uncaughtException', (err) => {
  logger.error('CRITICAL UNCAUGHT EXCEPTION: Restating node status...');
  logger.error(err);
  process.exit(1);
});
