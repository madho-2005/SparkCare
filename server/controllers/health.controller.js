import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Health check controller.
 * Provides system liveness and database readiness metrics for orchestrators,
 * load balancers (ALB, Nginx, Kubernetes), and uptime monitoring.
 */
export const checkHealth = (req, res, dbStateOverride = null) => {
  const isDbConnected = dbStateOverride !== null ? Boolean(dbStateOverride) : mongoose.connection.readyState === 1;

  const healthData = {
    status: isDbConnected ? 'healthy' : 'degraded',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memoryUsage: {
      heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      healthData,
      isDbConnected
        ? 'SparkCare Server Health check successful.'
        : 'Database connectivity degraded.'
    )
  );
};
