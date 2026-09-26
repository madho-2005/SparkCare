/**
 * Express Controller wrapper that catches unresolved asynchronous promises 
 * and routes them to the central error handling middleware pipeline.
 * Eliminates repetitive try-catch blocks.
 * 
 * @param {Function} fn - Asynchronous controller function.
 * @returns {Function} Express middleware wrapper.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};
