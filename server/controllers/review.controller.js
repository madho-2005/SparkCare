import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Service } from '../models/Service.js';
import { Order } from '../models/Order.js';
import { Booking } from '../models/Booking.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Add a rating and review for a product.
 * Requires verified purchase: user must have a delivered order containing the product.
 * Endpoint: POST /api/v1/reviews/products/:productId
 * Access: Protected (Verified Purchasers Only)
 */
export const addProductReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  // 1. Strict input validation
  const parsedRating = Number(rating);
  if (!rating || isNaN(parsedRating) || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return next(new AppError('Rating must be a whole integer between 1 and 5.', 400));
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
    return next(new AppError('Review comment must be at least 5 characters long.', 400));
  }

  if (comment.trim().length > 500) {
    return next(new AppError('Review comment cannot exceed 500 characters.', 400));
  }

  // 2. Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Target product does not exist.', 404));
  }

  // 3. Verified Purchase Check: User must have an order containing this product in 'delivered' status
  const eligibleOrder = await Order.findOne({
    customer: userId,
    orderStatus: 'delivered',
    'items.product': productId,
  });

  if (!eligibleOrder) {
    return next(
      new AppError(
        'Only verified customers with a successfully delivered order for this product can submit a review.',
        403
      )
    );
  }

  // 4. Check if user already reviewed this product
  const existingReview = await Review.findOne({ user: userId, product: productId });
  if (existingReview) {
    return next(new AppError('You have already submitted a review for this product.', 400));
  }

  // 5. Create review with server-assigned verifiedPurchase flag (never trust client input)
  const review = await Review.create({
    user: userId,
    product: productId,
    order: eligibleOrder._id,
    verifiedPurchase: true,
    rating: parsedRating,
    comment: comment.trim(),
  });

  ApiResponse.send(res, 201, review, 'Product review submitted successfully.');
});

/**
 * Retrieve all reviews for a specific product.
 * Endpoint: GET /api/v1/reviews/products/:productId
 * Access: Public
 */
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new AppError('Invalid product identifier format.', 400));
  }

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  ApiResponse.send(res, 200, reviews, 'Reviews retrieved successfully.');
});

/**
 * Add a rating and review for an electrician service.
 * Requires verified booking: user must have a 'completed' service booking.
 * Endpoint: POST /api/v1/reviews/services/:serviceId
 * Access: Protected (Verified Clients Only)
 */
export const addServiceReview = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return next(new AppError('Invalid service identifier format.', 400));
  }

  // 1. Strict input validation
  const parsedRating = Number(rating);
  if (!rating || isNaN(parsedRating) || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return next(new AppError('Rating must be a whole integer between 1 and 5.', 400));
  }

  if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
    return next(new AppError('Review comment must be at least 5 characters long.', 400));
  }

  if (comment.trim().length > 500) {
    return next(new AppError('Review comment cannot exceed 500 characters.', 400));
  }

  // 2. Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    return next(new AppError('Target service does not exist.', 404));
  }

  // 3. Verified Booking Check: User must have a booking in 'completed' status
  const eligibleBooking = await Booking.findOne({
    customer: userId,
    service: serviceId,
    bookingStatus: 'completed',
  });

  if (!eligibleBooking) {
    return next(
      new AppError(
        'Only verified clients with a completed electrician service booking can submit a review.',
        403
      )
    );
  }

  // 4. Check if user already reviewed this service
  const existingReview = await Review.findOne({ user: userId, service: serviceId });
  if (existingReview) {
    return next(new AppError('You have already submitted a review for this electrician service.', 400));
  }

  // 5. Create review with server-assigned verifiedPurchase flag
  const review = await Review.create({
    user: userId,
    service: serviceId,
    booking: eligibleBooking._id,
    verifiedPurchase: true,
    rating: parsedRating,
    comment: comment.trim(),
  });

  ApiResponse.send(res, 201, review, 'Service review submitted successfully.');
});

/**
 * Retrieve all reviews for a specific service.
 * Endpoint: GET /api/v1/reviews/services/:serviceId
 * Access: Public
 */
export const getServiceReviews = asyncHandler(async (req, res, next) => {
  const { serviceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return next(new AppError('Invalid service identifier format.', 400));
  }

  const reviews = await Review.find({ service: serviceId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  ApiResponse.send(res, 200, reviews, 'Service reviews retrieved successfully.');
});

/**
 * Public dashboard feed retrieving latest platform reviews for trust carousels.
 * Endpoint: GET /api/v1/reviews/latest
 * Access: Public
 */
export const getLatestReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('product', 'name slug')
    .populate('service', 'title slug')
    .sort({ createdAt: -1 })
    .limit(6);

  ApiResponse.send(res, 200, reviews, 'Latest reviews retrieved successfully.');
});

/**
 * Delete review tool.
 * Permitted only to the review author or platform administrators.
 * Endpoint: DELETE /api/v1/reviews/:id
 * Access: Protected (Author or Admin Only)
 */
export const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid review identifier format.', 400));
  }

  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError('Target review not found.', 404));
  }

  // Enforce ownership: only the review creator or an admin can delete
  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only delete your own reviews.', 403));
  }

  await Review.findByIdAndDelete(id);

  // Recalculate average ratings dynamically
  if (review.product) {
    await Review.calculateAverageRating(review.product, 'product');
  }
  if (review.service) {
    await Review.calculateAverageRating(review.service, 'service');
  }

  ApiResponse.send(res, 200, null, 'Review has been successfully deleted.');
});
