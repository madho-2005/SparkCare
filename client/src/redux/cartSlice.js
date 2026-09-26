import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import { loginUser, registerUser, logoutUser, checkAuthStatus } from './authSlice';

/**
 * Returns a fresh, pristine empty cart data object.
 */
const getEmptyCart = () => ({
  items: [],
  shippingAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
  },
  paymentMethod: 'stripe',
  coupon: null,
});

/**
 * Computes isolated localStorage key for a given user or guest session.
 * e.g., sparkcare_cart_64a1b2c3d4e5f vs sparkcare_cart_guest
 */
const getStorageKey = (userId) => {
  if (userId && typeof userId === 'string' && userId.trim().length > 0) {
    return `sparkcare_cart_${userId.trim()}`;
  }
  return 'sparkcare_cart_guest';
};

/**
 * Safely loads and parses cart state from localStorage for a specific user ID or guest.
 * Enforces schema integrity and falls back to a clean empty cart on errors or missing data.
 */
const loadCartFromStorage = (userId) => {
  const empty = getEmptyCart();
  try {
    // If loading guest cart on a brand-new tab/session, clear any leftover guest cache
    if (!userId) {
      const sessionKey = 'sparkcare_session_started';
      const isNewSession = !sessionStorage.getItem(sessionKey);
      if (isNewSession) {
        sessionStorage.setItem(sessionKey, '1');
        localStorage.removeItem('sparkcare_cart_guest');
        return empty;
      }
    }

    const key = getStorageKey(userId);
    const serialized = localStorage.getItem(key);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        shippingAddress: parsed.shippingAddress && typeof parsed.shippingAddress === 'object'
          ? {
              street: parsed.shippingAddress.street || '',
              city: parsed.shippingAddress.city || '',
              state: parsed.shippingAddress.state || '',
              zipCode: parsed.shippingAddress.zipCode || '',
            }
          : { street: '', city: '', state: '', zipCode: '' },
        paymentMethod: parsed.paymentMethod || 'stripe',
        coupon: parsed.coupon || null,
      };
    }
  } catch (err) {
    console.warn(`Failed to parse cart cache from storage key "${getStorageKey(userId)}"`, err);
  }
  return empty;
};

/**
 * Persists current cart state to the isolated storage key corresponding to state.userId.
 */
const saveCartToStorage = (state) => {
  try {
    const key = getStorageKey(state.userId);
    const payload = {
      items: state.items || [],
      shippingAddress: state.shippingAddress || { street: '', city: '', state: '', zipCode: '' },
      paymentMethod: state.paymentMethod || 'stripe',
      coupon: state.coupon || null,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn(`Failed to save cart to storage key "${getStorageKey(state.userId)}"`, err);
  }
};

const initialState = {
  ...loadCartFromStorage(null),
  userId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, name, price, image, stock, quantity = 1 } = action.payload;
      const existingIndex = state.items.findIndex((item) => item.product === product);

      if (existingIndex >= 0) {
        const newQty = state.items[existingIndex].quantity + quantity;
        if (newQty > stock) {
          toast.error(`Cannot add more items. Only ${stock} units available in warehouse inventory.`);
          state.items[existingIndex].quantity = stock;
        } else {
          state.items[existingIndex].quantity = newQty;
          toast.success(`Updated "${name}" quantity to ${state.items[existingIndex].quantity}`);
        }
      } else {
        if (quantity > stock) {
          toast.error(`Cannot add. Only ${stock} units available.`);
        } else {
          state.items.push({ product, name, price, image, stock, quantity });
          toast.success(`Added "${name}" to shopping cart.`);
        }
      }
      saveCartToStorage(state);
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product !== productId);
      toast.success('Item removed from cart');
      saveCartToStorage(state);
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product === productId);
      if (item) {
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items are available in stock.`);
          item.quantity = item.stock;
        } else if (quantity < 1) {
          item.quantity = 1;
        } else {
          item.quantity = quantity;
        }
      }
      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      saveCartToStorage(state);
    },

    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload || { street: '', city: '', state: '', zipCode: '' };
      saveCartToStorage(state);
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload || 'stripe';
      saveCartToStorage(state);
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload;
      toast.success(`Coupon "${action.payload.code}" applied! Saved ${formatINR(action.payload.discountAmount)}`);
      saveCartToStorage(state);
    },

    removeCoupon: (state) => {
      state.coupon = null;
      toast.success('Coupon discount removed');
      saveCartToStorage(state);
    },

    resetCartState: (state) => {
      const empty = getEmptyCart();
      state.items = empty.items;
      state.shippingAddress = empty.shippingAddress;
      state.paymentMethod = empty.paymentMethod;
      state.coupon = empty.coupon;
      state.userId = null;
    },

    hydrateUserCart: (state, action) => {
      const targetUserId = action.payload?.userId || null;
      state.userId = targetUserId;
      const hydrated = loadCartFromStorage(targetUserId);
      state.items = hydrated.items;
      state.shippingAddress = hydrated.shippingAddress;
      state.paymentMethod = hydrated.paymentMethod;
      state.coupon = hydrated.coupon;
    },
  },
  extraReducers: (builder) => {
    builder
      // Logout or Session Expiry: Completely reset in-memory cart state to prevent data leakage
      .addMatcher(
        (action) =>
          [logoutUser.fulfilled.type, logoutUser.rejected.type, checkAuthStatus.rejected.type].includes(action.type),
        (state) => {
          state.userId = null;
          const empty = getEmptyCart();
          state.items = empty.items;
          state.shippingAddress = empty.shippingAddress;
          state.paymentMethod = empty.paymentMethod;
          state.coupon = empty.coupon;
        }
      )
      // Login, Register, or Session Check Success: Hydrate ONLY this authenticated user's cart
      .addMatcher(
        (action) =>
          [loginUser.fulfilled.type, registerUser.fulfilled.type, checkAuthStatus.fulfilled.type].includes(action.type),
        (state, action) => {
          const user = action.payload?.user;
          const userId = user?._id || user?.id || null;
          state.userId = userId;

          if (userId) {
            const userCart = loadCartFromStorage(userId);
            state.items = userCart.items;
            state.shippingAddress = userCart.shippingAddress;
            state.paymentMethod = userCart.paymentMethod;
            state.coupon = userCart.coupon;
          }
        }
      );
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setShippingAddress,
  setPaymentMethod,
  applyCoupon,
  removeCoupon,
  resetCartState,
  hydrateUserCart,
} = cartSlice.actions;

export default cartSlice.reducer;

