import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Authentication Route Guard.
 * Authenticates incoming client requests by extracting JWT access tokens from either:
 * 1. Bearer Header (Authorization: Bearer <JWT>)
 * 2. Signed HttpOnly Cookies (`accessToken`)
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract access token from authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication failed. Access token is missing.', 401));
  }

  // Decrypt and verify access token legitimacy
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  // Retrieve matching active user from db (excluding password fields)
  // Utilizes a dynamic model import to prevent circular dependency problems if models are loaded early
  const User = mongoose.model('User');
  const currentUser = await User.findById(decoded.id).select('+refreshTokenHash');

  if (!currentUser) {
    return next(new AppError('The user belonging to this active session no longer exists.', 401));
  }

  if (!currentUser.refreshTokenHash) {
    return next(new AppError('Authentication session has been terminated. Please log in again.', 401));
  }

  // Strip refreshTokenHash from memory object so downstream handlers never expose it
  currentUser.refreshTokenHash = undefined;

  // Bind authenticated User reference to request context for subsequent routing controllers
  req.user = currentUser;
  next();
});

/**
 * Role-Based Access Control (RBAC) Guard.
 * Restricts endpoint access to specific authorized user tiers.
 * Must be mounted AFTER mounting the protect middleware guard.
 * 
 * @param {...String} allowedRoles - Array of roles permitted (e.g. 'admin', 'provider')
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Internal Security error. Authentication context is missing.', 500));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Security Warning: User "${req.user.email}" with role "${req.user.role}" attempted unauthorized access to restricted resource.`);
      return next(new AppError('Access denied. You do not possess the required privileges for this action.', 403));
    }

    next();
  };
};
