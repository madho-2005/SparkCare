import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

// Setup Cloudinary credentials using environment variables
// Note: Cloudinary expects CLOUDINARY_URL or explicit keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Cloudinary Media Ingestion Service.
 * Leverages stream pipelines to transmit file buffers in memory straight to CDN endpoints.
 */
export const uploadToCloudinary = (fileBuffer, folderName = 'sparkcare') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary credentials are fully configured or in test mode
    if (process.env.NODE_ENV === 'test' || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return resolve({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        public_id: 'placeholder',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary Upload Failure: ${error.message}`);
          return reject(new AppError('Failed to upload image asset to Cloudinary. Please try again.', 500));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Write file buffer straight into stream pipeline
    uploadStream.end(fileBuffer);
  });
};

/**
 * Removes media assets from Cloudinary using their public_id.
 * 
 * @param {String} publicId - Public identifier of asset to delete.
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId || publicId === 'placeholder') return;
    
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      logger.warn(`Cloudinary deletion response was not ok: ${JSON.stringify(result)}`);
    }
  } catch (error) {
    logger.error(`Cloudinary Deletion Failure: ${error.message}`);
  }
};
