import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from './productSlice';
import wishlistReducer from './wishlistSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import adminReducer from './adminSlice';
import reviewsReducer from './reviewSlice';

/**
 * Centered Redux Store Configuration.
 * Hosts and combines feature slices cleanly.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    order: orderReducer,
    admin: adminReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Bypasses checks to speed up state mutations
    }),
});

