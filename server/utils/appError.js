/**
 * Standard Operational Error Wrapper.
 * Used to explicitly represent predicted operational anomalies (e.g. invalid credentials, resource missing)
 * rather than system runtime bugs. Includes automatic capturing of the stack trace.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    
    this.statusCode = statusCode;
    // Status prefix: 4xx errors translate to 'fail', 5xx errors translate to 'error'
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Identifies this error as operational (handling it cleanly instead of crashing node)
    this.isOperational = true;

    // Capture the stack trace without including the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}
