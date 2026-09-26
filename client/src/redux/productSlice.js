import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import axios from 'axios';

// Async Thunk: Retrieve filtered & paginated products (with abort signal support)
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await api.get('/products', { params, signal });
      return response.data.data; // { products, totalProducts, totalPages, currentPage, limit }
    } catch (error) {
      if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        return rejectWithValue('__CANCELED__');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Async Thunk: Retrieve category list dynamically
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/categories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Async Thunk: Retrieve related products for details view without polluting main catalog
export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelated',
  async ({ category, currentId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', {
        params: { category, limit: 6 }
      });
      const items = response.data.data?.products || [];
      return items.filter((p) => p._id !== currentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch related products');
    }
  }
);

// Async Thunk: Retrieve single product details
export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product details');
    }
  }
);

// Async Thunk: Retrieve reviews for a specific product
export const fetchProductReviews = createAsyncThunk(
  'products/fetchReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/products/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Async Thunk: Submit review & rating for a product
export const addProductReview = createAsyncThunk(
  'products/addReview',
  async ({ productId, rating, comment }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/reviews/products/${productId}`, { rating, comment });
      // Re-fetch reviews to refresh user interfaces instantly
      dispatch(fetchProductReviews(productId));
      // Re-fetch product details to sync aggregated rating scores!
      dispatch(fetchProductDetails(productId));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

const initialState = {
  products: [],
  totalProducts: 0,
  totalPages: 1,
  currentPage: 1,
  categories: [],
  relatedProducts: [],
  selectedProduct: null,
  reviews: [],
  loading: false,
  detailsLoading: false,
  relatedLoading: false,
  error: null,
  detailsError: null,
  submitReviewLoading: false,
  currentRequestId: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.reviews = [];
      state.relatedProducts = [];
      state.detailsError = null;
    },
    clearProductError: (state) => {
      state.error = null;
      state.detailsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          const rawItems = action.payload?.products || [];
          state.products = Array.from(
            new Map(
              rawItems
                .filter((p) => p && p._id)
                .map((p) => [String(p._id), p])
            ).values()
          );
          state.totalProducts = action.payload?.totalProducts || state.products.length;
          state.totalPages = action.payload?.totalPages || 1;
          state.currentPage = action.payload?.currentPage || 1;
          state.error = null;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (action.payload === '__CANCELED__') return;
        if (state.currentRequestId === action.meta.requestId) {
          state.loading = false;
          state.error = action.payload || 'Unable to load products. Please try again.';
        }
      })

      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })

      // Fetch Related Products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.relatedLoading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedLoading = false;
        state.relatedProducts = action.payload || [];
      })
      .addCase(fetchRelatedProducts.rejected, (state) => {
        state.relatedLoading = false;
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedProduct = action.payload;
        state.detailsError = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload || 'Product not found or unavailable.';
      })

      // Fetch Reviews
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviews = action.payload || [];
      })

      // Submit Review
      .addCase(addProductReview.pending, (state) => {
        state.submitReviewLoading = true;
      })
      .addCase(addProductReview.fulfilled, (state) => {
        state.submitReviewLoading = false;
      })
      .addCase(addProductReview.rejected, (state) => {
        state.submitReviewLoading = false;
      });
  }
});

export const { clearSelectedProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
