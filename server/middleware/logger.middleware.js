import morgan from 'morgan';
import { logger } from '../utils/logger.js';

// Setup Morgan request logging stream piped to Winston logger
const stream = {
  write: (message) => logger.info(message.trim()),
};

// Define standard logging formats
// In production: concise path and timing metadata
// In development: colorized full output
const format = process.env.NODE_ENV === 'production' 
  ? ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
  : 'dev';

// Skip asset queries or health check polls in production to prevent log spam
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' && false; // Customize conditions if necessary
};

/**
 * HTTP Morgan logging middleware.
 * Routes raw Apache/dev web streams into the winston logging container.
 */
export const httpLogger = morgan(format, { stream, skip });
