import { logger } from './logger.js';

/**
 * Startup Environment & Secrets Validator.
 * Verifies that required configuration parameters are present, sufficiently complex,
 * and not set to default sample placeholders before the application boots.
 */
export const validateEnv = () => {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // Required parameters
  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required.');
  } else if (isProd && process.env.MONGODB_URI.includes('localhost')) {
    warnings.push('MONGODB_URI points to localhost in production mode.');
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    errors.push('ACCESS_TOKEN_SECRET is required.');
  } else if (process.env.ACCESS_TOKEN_SECRET.includes('placeholder') || process.env.ACCESS_TOKEN_SECRET.length < 32) {
    if (isProd) {
      errors.push('ACCESS_TOKEN_SECRET must be a cryptographically strong secret (at least 32 characters) in production.');
    } else {
      warnings.push('ACCESS_TOKEN_SECRET is short or contains placeholder text.');
    }
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    errors.push('REFRESH_TOKEN_SECRET is required.');
  } else if (process.env.REFRESH_TOKEN_SECRET.includes('placeholder') || process.env.REFRESH_TOKEN_SECRET.length < 32) {
    if (isProd) {
      errors.push('REFRESH_TOKEN_SECRET must be a cryptographically strong secret (at least 32 characters) in production.');
    } else {
      warnings.push('REFRESH_TOKEN_SECRET is short or contains placeholder text.');
    }
  }

  if (!process.env.ALLOWED_ORIGINS) {
    if (isProd) {
      errors.push('ALLOWED_ORIGINS must be explicitly configured in production (e.g. https://sparkcare.com).');
    } else {
      warnings.push('ALLOWED_ORIGINS is not set; falling back to http://localhost:3000,http://localhost:5173.');
    }
  }

  // Cloudinary credentials check
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    warnings.push('Cloudinary credentials are incomplete; image uploads will not persist to cloud storage.');
  }

  // SMTP Email configuration check
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || (!process.env.SMTP_PASSWORD && !process.env.SMTP_PASS)) {
    warnings.push('SMTP configuration incomplete; transactional emails will spool to local audit logs.');
  }

  // Log summary
  if (warnings.length > 0) {
    warnings.forEach((w) => logger.warn(`[Config Warning] ${w}`));
  }

  if (errors.length > 0) {
    errors.forEach((e) => logger.error(`[Config Error] ${e}`));
    if (isProd) {
      logger.error('FATAL: Production configuration validation failed. Aborting startup.');
      process.exit(1);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};
