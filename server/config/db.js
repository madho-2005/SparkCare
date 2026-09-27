import dns from 'dns';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Resolve MongoDB SRV records via reliable public DNS (fixes Windows/ISP querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  logger.warn(`Could not override DNS servers: ${dnsErr.message}`);
}

/**
 * Initializes and configures the MongoDB connection using Mongoose.
 * Implements robust connection pooling, automatic retries, and event monitoring.
 */
export const connectDB = async (retries = 5, delay = 2000) => {
  const options = {
    maxPoolSize: 100,      // Maintain up to 100 socket connections
    minPoolSize: 10,       // Keep at least 10 sockets open
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    serverSelectionTimeoutMS: 8000, // Timeout after 8s if MongoDB cluster is unreachable
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, options);
      logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`MongoDB Connection failure (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        logger.info(`Retrying MongoDB connection in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 1.5;
      } else {
        logger.error('All MongoDB connection attempts exhausted. Shutting down.');
        process.exit(1);
      }
    }
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
