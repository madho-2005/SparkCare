import crypto from 'crypto';
import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Generates a SHA-256 hash of a raw token for secure database persistence.
 * Prevents database read compromise / leak from revealing active session tokens.
 */
export const hashToken = (token) => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Constant-time comparison to verify incoming refresh token against stored hash.
 * Includes seamless backward compatibility for any legacy unhashed JWT tokens.
 */
export const verifyTokenHash = (storedHash, incomingToken) => {
  if (!storedHash || !incomingToken) return false;
  // Zero-downtime migration check for pre-existing unhashed JWTs (which start with 'eyJ')
  if (storedHash.startsWith('eyJ')) {
    return storedHash === incomingToken;
  }
  const incomingHash = hashToken(incomingToken);
  if (storedHash.length !== incomingHash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(incomingHash, 'hex'));
};

// Cookie structure config parameters
export const getCookieOptions = (req = null) => {
  const isHttps = Boolean(
    process.env.NODE_ENV === 'production' ||
    process.env.COOKIE_CROSS_SITE === 'true' ||
    (req && (req.secure || req.headers?.['x-forwarded-proto'] === 'https')) ||
    (req && req.headers?.origin && req.headers.origin.includes('vercel.app'))
  );

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
  };
};

export const cookieOptions = getCookieOptions();

// Configures authentication access & refresh cookie headers
const sendTokenResponse = async (user, statusCode, res, message, req = null) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Securely store SHA-256 hash of the refresh token in DB
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  
  const options = getCookieOptions(req);

  res.cookie('accessToken', accessToken, {
    ...options,
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15m
  });

  res.cookie('refreshToken', refreshToken, {
    ...options,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7d
  });

  // Remove credentials before returning the payload
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    isVerified: user.isVerified,
  };

  ApiResponse.send(res, statusCode, { user: userData, accessToken }, message);
};

/**
 * Registers new User.
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return next(new AppError('Valid email and password strings are required.', 400));
  }

  const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
  if (existingUser) {
    return next(new AppError('An account with this email address already exists.', 400));
  }

  const user = await User.create({
    name,
    email: email.trim().toLowerCase(),
    password,
    phoneNumber,
  });

  await sendTokenResponse(user, 201, res, 'Account registered successfully.', req);
});

/**
 * Logins existing user.
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return next(new AppError('Invalid email address or password.', 401));
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email address or password.', 401));
  }

  await sendTokenResponse(user, 200, res, 'Signed in successfully.', req);
});


/**
 * Logs out active sessions and revokes refresh tokens.
 */
export const logout = asyncHandler(async (req, res, next) => {
  let userId = req.user?._id;

  // If req.user is not present (e.g. access token expired), extract user identity from tokens
  if (!userId) {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        userId = decoded.id;
      } catch {
        try {
          const decoded = jwt.decode(refreshToken);
          userId = decoded?.id;
        } catch {}
      }
    }
  }

  if (!userId && req.cookies?.accessToken) {
    try {
      const decoded = jwt.decode(req.cookies.accessToken);
      userId = decoded?.id;
    } catch {}
  }

  if (!userId && req.headers?.authorization?.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.decode(token);
      userId = decoded?.id;
    } catch {}
  }

  // Revoke user's refresh token in database
  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save({ validateBeforeSave: false });
        logger.info(`[Auth] User ${userId} session terminated and refresh token revoked.`);
      }
    } catch (err) {
      logger.warn(`[Auth] Failed to wipe refresh token for user ${userId}:`, err);
    }
  }

  // Flush cookie stores unconditionally
  const dynamicCookieOpts = getCookieOptions(req);
  res.clearCookie('accessToken', dynamicCookieOpts);
  res.clearCookie('refreshToken', dynamicCookieOpts);

  ApiResponse.send(res, 200, null, 'Logged out successfully.');
});

/**
 * Rotates expired Access & Refresh Tokens.
 */
export const refresh = asyncHandler(async (req, res, next) => {
  const dynamicCookieOpts = getCookieOptions(req);
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.clearCookie('accessToken', dynamicCookieOpts);
    res.clearCookie('refreshToken', dynamicCookieOpts);
    return next(new AppError('Authentication session missing. Please log in again.', 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash || !verifyTokenHash(user.refreshTokenHash, refreshToken)) {
      // Replay threat detection or revoked session
      logger.warn(`Security Warning: Refresh token reuse detected or invalid token. Revoking all sessions for user.`);
      if (user) {
        user.refreshTokenHash = undefined;
        await user.save({ validateBeforeSave: false });
      }
      res.clearCookie('accessToken', dynamicCookieOpts);
      res.clearCookie('refreshToken', dynamicCookieOpts);
      return next(new AppError('Security violation detected. Please sign in again.', 401));
    }

    // Refresh match verified: execute new token pair rotation
    await sendTokenResponse(user, 200, res, 'Authentication session rotated successfully.', req);
  } catch (error) {
    res.clearCookie('accessToken', dynamicCookieOpts);
    res.clearCookie('refreshToken', dynamicCookieOpts);
    return next(new AppError('Invalid or expired refresh token. Please sign in again.', 401));
  }
});

/**
 * Get current logged in user details.
 * Endpoint: GET /api/v1/auth/me
 * Access: Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User profile not found.', 404));
  }
  ApiResponse.send(res, 200, { user }, 'User profile retrieved successfully.');
});

/**
 * Update current user profile or credentials.
 * Endpoint: PATCH /api/v1/auth/profile
 * Access: Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phoneNumber, addresses, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User profile not found.', 404));
  }

  if (name) user.name = name;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (addresses && Array.isArray(addresses)) user.addresses = addresses;

  // Handle password update if provided
  if (newPassword) {
    if (!currentPassword) {
      return next(new AppError('Please provide your current password to update your password.', 400));
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password provided is incorrect.', 400));
    }
    if (newPassword.length < 8) {
      return next(new AppError('New password must be at least 8 characters long.', 400));
    }
    user.password = newPassword; // Pre-save hook will hash this automatically
  }

  await user.save();

  const updatedUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    addresses: user.addresses,
    isVerified: user.isVerified,
  };

  ApiResponse.send(res, 200, { user: updatedUser }, 'Profile updated successfully.');
});

