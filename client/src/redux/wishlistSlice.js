import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { logoutUser, checkAuthStatus } from './authSlice';
import toast from 'react-hot-toast';

// Async Thunk: Retrieve user's wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist');
      return response.data.data; // { _id, user, products: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

// Async Thunk: Toggle a product in user's wishlist
export const toggleWishlistProduct = createAsyncThunk(
  'wishlist/toggle',
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/wishlist/toggle/${productId}`);
      
      const { action } = response.data.data;
      if (action === 'added') {
        toast.success('Product added to Wishlist!');
      } else {
        toast.success('Product removed from Wishlist!');
      }
      
      // Refresh full wishlist data to sync populated items
      dispatch(fetchWishlist());
      
      return response.data.data; // { action, productIds: [...] }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login required to modify Wishlist');
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle wishlist');
    }
  }
);

const initialState = {
  wishlistProducts: [],
  wishlistedIds: [],
  loading: false,
  error: null
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.wishlistProducts = [];
      state.wishlistedIds = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistProducts = action.payload?.products || [];
        state.wishlistedIds = (action.payload?.products || []).map(p => p._id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle Wishlist
      .addCase(toggleWishlistProduct.fulfilled, (state, action) => {
        state.wishlistedIds = action.payload.productIds;
      })

      // Clear on logout or session expiry
      .addMatcher(
        (action) =>
          [logoutUser.fulfilled.type, logoutUser.rejected.type, checkAuthStatus.rejected.type].includes(action.type),
        (state) => {
          state.wishlistProducts = [];
          state.wishlistedIds = [];
          state.error = null;
          state.loading = false;
        }
      );
  }
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

