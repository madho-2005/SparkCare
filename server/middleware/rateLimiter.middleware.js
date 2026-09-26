import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Login Endpoint.
 * Mitigates credential stuffing, password spray, and brute-force dictionary attacks.
 * Limit: 10 attempts per 15 minutes per IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Strict Rate Limiter for User Registration Endpoint.
 * Mitigates automated account creation, bot registration, and spam flooding.
 * Limit: 5 registrations per 1 hour per IP (10 in test environment).
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'test' ? 10 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many accounts registered from this IP address. Please try again after an hour.',
  },
});

/**
 * Rate Limiter for Token Refresh Endpoint.
 * Mitigates token refresh hammering and race attempts on session rotation.
 * Limit: 30 requests per 15 minutes per IP.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many token refresh requests from this IP address. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for Admin Analytics & Statistics Endpoints.
 * Mitigates denial-of-service, CPU/memory spikes, and DB exhaustion from repeated aggregation queries.
 * Limit: 60 requests per 15 minutes per IP (100 in test environment).
 */
export const adminStatsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 100 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    success: false,
    message: 'Too many administrative analytics queries from this IP address. Please try again after 15 minutes.',
  },
});

