import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/appError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Retrieve current user's wishlist populated with product details.
 */
export const getWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

  // Auto-initialize if it does not exist yet
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  ApiResponse.send(res, 200, wishlist, 'Wishlist retrieved successfully.');
});

/**
 * Toggle a product inside the user's wishlist.
 * Adds the product if not present; removes it if already present.
 */
export const toggleWishlistProduct = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  // 1. Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found.', 404));
  }

  // 2. Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }

  // 3. Determine whether to pull or push
  const isIncluded = wishlist.products.some(id => id.toString() === productId.toString());
  let action = 'added';

  if (isIncluded) {
    wishlist.products.pull(productId);
    action = 'removed';
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();

  ApiResponse.send(
    res,
    200,
    {
      action,
      productIds: wishlist.products,
    },
    `Product ${action} successfully.`
  );
});
