import winston from 'winston';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// Dynamic configuration matching target environment
const isProduction = process.env.NODE_ENV === 'production';

// Custom console log format for human-friendly development viewing
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

/**
 * Winston central logger configuration.
 * Automatically saves error-level anomalies to distinct storage volumes in production
 * and outputs human-friendly logging during local development tasks.
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // Automatically parses and maps error stack traces
    isProduction ? json() : combine(colorize(), consoleFormat)
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : [])
  ],
});
