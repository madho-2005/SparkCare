import { AppError } from '../utils/appError.js';

/**
 * Standard Zod Request Validation Middleware.
 * Validates the incoming HTTP request parts (body, params, query) against a pre-compiled Zod validation schema.
 * Automatically processes validation anomalies and maps field validation issues cleanly to the client.
 * 
 * @param {Object} schemas - Validation schemas object (containing body, params, or query targets)
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        // Wrap ZodError cleanly inside a structured Express operational AppError
        const formattedMessage = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        const validationError = new AppError(`Validation constraints failed: ${formattedMessage}`, 400);
        validationError.errors = validationErrors; // Bind precise details for mapping
        
        return next(validationError);
      }
      next(error);
    }
  };
};
