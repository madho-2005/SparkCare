import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

// Development error details (includes detailed stack tracing)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err
  });
};

// Production error details (sanitized, safe operational anomalies only)
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Trusted operational anomaly: send detailed explanation to user
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } else {
    // Programming flaw or unknown library fault: mask internal secrets from client
    logger.error('CRITICAL UNEXPECTED EXCEPTION:', err);

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
};

// MongoDB Invalid Object ID Cast Handler
const handleCastErrorDB = (err) => {
  const message = `Invalid value "${err.value}" provided for field: ${err.path}.`;
  return new AppError(message, 400);
};

// MongoDB Duplicate unique index keys handler
const handleDuplicateFieldsDB = (err) => {
  const errMsg = err.errmsg || err.message || '';
  const match = errMsg.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : (err.keyValue ? JSON.stringify(err.keyValue) : 'specified');
  const message = `Duplicate field value: ${value}. Please use another unique value.`;
  return new AppError(message, 400);
};

// Mongoose schema schema validation parser
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation constraints failed: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

// JSON Web Token corruption handler
const handleJWTError = () => new AppError('Invalid authentication token. Please sign in again.', 401);

// JSON Web Token expiration handler
const handleJWTExpiredError = () => new AppError('Your authentication session has expired. Please log in again.', 401);

/**
 * Express Global Error Handling Middleware Pipeline.
 * Formats all uncaught operational errors into standard structures and hides internal backend secrets.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err);
    error.message = err.message;

    // Standardize third-party database/auth driver issues
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
