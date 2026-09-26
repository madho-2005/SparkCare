import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { clearCart } from './cartSlice';
import { logoutUser, checkAuthStatus } from './authSlice';
import toast from 'react-hot-toast';

// 1. Places order
export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      dispatch(clearCart()); // auto wipe cart on success
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 2. Uploads QR transfer proof receipt screenshot
export const uploadQrProof = createAsyncThunk(
  'order/uploadQrProof',
  async ({ orderId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${orderId}/pay-qr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Screenshot receipt uploaded! Pending admin review.');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload screenshot proof';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 3. Fetches logged-in client orders list
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load order history');
    }
  }
);

// 4. Fetches printable invoice sheet
export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch invoice details');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    myOrders: [],
    currentOrder: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.success = true;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Upload QR Proof
      .addCase(uploadQrProof.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadQrProof.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentOrder) {
          state.currentOrder.payment = action.payload.payment;
        }
      })
      .addCase(uploadQrProof.rejected, (state) => {
        state.loading = false;
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear on logout or session expiry
      .addMatcher(
        (action) =>
          [logoutUser.fulfilled.type, logoutUser.rejected.type, checkAuthStatus.rejected.type].includes(action.type),
        (state) => {
          state.myOrders = [];
          state.currentOrder = null;
          state.loading = false;
          state.error = null;
          state.success = false;
        }
      );
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;

