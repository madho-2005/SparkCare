import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/appError.js';

// Store files directly in RAM memory buffer to bypass local file clutter 
// and enable direct pipeline streams to Cloudinary
const storage = multer.memoryStorage();

// Whitelist allowed image extensions and MIME types
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * File filter for initial MIME type and extension validation.
 * Strictly blocks SVGs, XML, and non-raster image formats at HTTP boundary.
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  // Reject SVG and XML explicitly
  if (
    ext === '.svg' ||
    ext === '.xml' ||
    mimetype === 'image/svg+xml' ||
    mimetype.includes('xml') ||
    mimetype.includes('svg')
  ) {
    return cb(
      new AppError('SVG and vector formats are not allowed for security reasons. Please upload JPG, PNG, or WebP.', 400),
      false
    );
  }

  // Validate against whitelist
  if (ALLOWED_MIME_TYPES.has(mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError('Unsupported file format. Please upload valid image files only (JPEG, PNG, WebP).', 400),
      false
    );
  }
};

/**
 * Reusable Multer File Upload Middleware config.
 * Configured with 5MB strict limit and direct RAM buffering.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size capacity per target image
  },
});

/**
 * Inspects buffer binary signatures (magic bytes) to prevent MIME spoofing attacks
 * and deep-scans for embedded script/markup payloads (e.g. polyglot SVGs or XSS vectors).
 *
 * @param {Buffer} buffer - In-memory file buffer
 * @returns {boolean} - True if valid raster image with safe content, false otherwise
 */
export const validateImageMagicBytes = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  // 1. JPEG signature: 0xFF 0xD8 0xFF
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  // 2. PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A;

  // 3. WebP signature: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (!isJpeg && !isPng && !isWebp) {
    return false;
  }

  // 4. Deep-scan first 8KB of buffer for embedded script / XML / SVG payload markers
  const headerSample = buffer.subarray(0, Math.min(buffer.length, 8192)).toString('latin1').toLowerCase();
  const dangerousPatterns = ['<svg', '<?xml', '<script', 'onload=', 'onerror=', '<html', '<!doctype'];

  for (const pattern of dangerousPatterns) {
    if (headerSample.includes(pattern)) {
      return false;
    }
  }

  return true;
};

/**
 * Middleware that verifies magic bytes of in-memory buffered uploads.
 * Must run immediately after multer upload middleware.
 */
export const verifyImageBuffer = (req, res, next) => {
  const filesToVerify = [];

  if (req.file) {
    filesToVerify.push(req.file);
  }

  if (Array.isArray(req.files)) {
    filesToVerify.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((item) => {
      if (Array.isArray(item)) {
        filesToVerify.push(...item);
      } else if (item) {
        filesToVerify.push(item);
      }
    });
  }

  for (const file of filesToVerify) {
    if (!file.buffer || !validateImageMagicBytes(file.buffer)) {
      return next(
        new AppError(
          'Invalid image content. File signature does not match an allowed raster image (JPEG, PNG, WebP) or contains unsafe content.',
          400
        )
      );
    }
  }

  next();
};
