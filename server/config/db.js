import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Initializes and configures the MongoDB connection using Mongoose.
 * Implements robust connection pooling and event monitoring for high availability.
 */
export const connectDB = async () => {
  const options = {
    maxPoolSize: 100,      // Maintain up to 100 socket connections
    minPoolSize: 10,       // Keep at least 10 sockets open
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    serverSelectionTimeoutMS: 5000, // Timeout after 5s if MongoDB is down
  };

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection failure: ${error.message}`);
    process.exit(1); // Hard shutdown in case DB is inaccessible at startup
  }
};

// Monitor connection state events
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB Connection runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB Connection interrupted. Retrying automatically...');
});

// Clean termination on process shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose default connection disconnected through app termination (SIGINT).');
  process.exit(0);
});
