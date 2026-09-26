import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// 1. Fetch public dashboard homepage slider feed
export const fetchLatestReviews = createAsyncThunk(
  'reviews/fetchLatestReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reviews/latest');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch latest testimonials');
    }
  }
);

// 2. Fetch product reviews
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/products/${productId}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load product reviews');
    }
  }
);

// 3. Post user review for a product
export const submitProductReview = createAsyncThunk(
  'reviews/submitProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/products/${productId}`, { rating, comment });
      toast.success('Your product review has been submitted!');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit product review';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 4. Fetch electrician service reviews
export const fetchServiceReviews = createAsyncThunk(
  'reviews/fetchServiceReviews',
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/services/${serviceId}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load service reviews');
    }
  }
);

// 5. Post user review for an electrician service
export const submitServiceReview = createAsyncThunk(
  'reviews/submitServiceReview',
  async ({ serviceId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/reviews/services/${serviceId}`, { rating, comment });
      toast.success('Your service review has been submitted successfully!');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit service review';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 6. Admin moderator purge
export const deleteReviewAdmin = createAsyncThunk(
  'reviews/deleteReviewAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Comment purged successfully by admin');
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to purge testimonial';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    latestReviews: [],
    productReviews: [],
    serviceReviews: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Latest Reviews
      .addCase(fetchLatestReviews.fulfilled, (state, action) => {
        state.latestReviews = action.payload;
      })
      
      // Product Reviews
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.productReviews = action.payload;
      })
      .addCase(submitProductReview.fulfilled, (state, action) => {
        state.productReviews.unshift(action.payload);
      })

      // Service Reviews
      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        state.serviceReviews = action.payload;
      })
      .addCase(submitServiceReview.fulfilled, (state, action) => {
        state.serviceReviews.unshift(action.payload);
      })

      // Admin Moderation
      .addCase(deleteReviewAdmin.fulfilled, (state, action) => {
        state.latestReviews = state.latestReviews.filter((r) => r._id !== action.payload);
        state.productReviews = state.productReviews.filter((r) => r._id !== action.payload);
        state.serviceReviews = state.serviceReviews.filter((r) => r._id !== action.payload);
      });
  },
});

export default reviewSlice.reducer;
