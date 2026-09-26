/**
 * NoSQL Injection & MongoDB Operator Sanitizer Middleware.
 * 
 * Deep-scans and strips keys containing prohibited characters:
 * 1. Prohibits any key starting with '$' (e.g. $gt, $ne, $where, $regex)
 * 2. Prohibits dot-notated keys (e.g. user.role) from untrusted request inputs
 * 
 * Protects req.body, req.query, and req.params from NoSQL injection attacks.
 */

const isPlainObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    const cleanObj = {};
    for (const key of Object.keys(value)) {
      // Reject or strip keys beginning with '$' or containing '.'
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeValue(value[key]);
    }
    return cleanObj;
  }

  return value;
};

export const mongoSanitize = (req, res, next) => {
  if (req.body && isPlainObject(req.body)) {
    req.body = sanitizeValue(req.body);
  }

  if (req.params && isPlainObject(req.params)) {
    req.params = sanitizeValue(req.params);
  }

  if (req.query && isPlainObject(req.query)) {
    // In Express, req.query can have getter/setter properties, so sanitize in-place
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.query[key];
      } else {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
  }

  next();
};
