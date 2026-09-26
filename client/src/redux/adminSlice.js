import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';
import toast from 'react-hot-toast';

// 1. Overview Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load telemetry stats');
    }
  }
);

// 2. Transaction Audit Logs
export const fetchAdminReports = createAsyncThunk(
  'admin/fetchAdminReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/reports');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate financial logs');
    }
  }
);

// 3. Coupon Codes list
export const fetchAdminCoupons = createAsyncThunk(
  'admin/fetchAdminCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/coupons');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load discount codes');
    }
  }
);

// 4. Create new Coupon code
export const createCoupon = createAsyncThunk(
  'admin/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/coupons', couponData);
      toast.success('Coupon code successfully active!');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate coupon code';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 5. Delete Coupon code
export const deleteCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon code purged successfully');
      return id;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete coupon';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 6. Registered Clients list
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/users');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load client database');
    }
  }
);

// 7. Elevate / adjust user role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      toast.success(`User role updated to ${role}`);
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user role';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 8. General store orders
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/orders');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load orders list');
    }
  }
);

// 9. Update order shipping tracking status
export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, { orderStatus });
      toast.success(`Order marked as: ${orderStatus}`);
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to adjust order status';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 10. Pending QR validations
export const fetchPendingQrPayments = createAsyncThunk(
  'admin/fetchPendingQrPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/payments/pending');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load pending payments');
    }
  }
);

// 11. Authorize / Reject payment screenshots
export const verifyPaymentProof = createAsyncThunk(
  'admin/verifyPaymentProof',
  async ({ paymentId, action }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/payments/verify/${paymentId}`, { action });
      toast.success(response.data.message || `Payment proof successfully ${action}ed`);
      return { paymentId, status: response.data.data.status };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete payment verification';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 12. Admin Product Inventory Listing
export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/admin/all', { params });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products inventory');
    }
  }
);

// 13. Admin Create Product
export const createAdminProduct = createAsyncThunk(
  'admin/createAdminProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Product created successfully!');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create product';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 14. Admin Update Product
export const updateAdminProduct = createAsyncThunk(
  'admin/updateAdminProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Product updated successfully!');
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 15. Admin Toggle Product Status
export const toggleProductStatus = createAsyncThunk(
  'admin/toggleProductStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/products/${id}/status`, { status });
      toast.success(response.data.message || `Product status changed to ${status}`);
      return response.data.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product status';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// 16. Admin Delete/Deactivate Product
export const deleteAdminProduct = createAsyncThunk(
  'admin/deleteAdminProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${id}`);
      toast.success(response.data.message || 'Product deactivated successfully');
      return response.data.data || { _id: id, status: 'inactive', isActive: false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to deactivate product';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: {
      summary: {
        grossRevenue: 0,
        ordersRevenue: 0,
        bookingsRevenue: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalBookings: 0,
        pendingBookings: 0,
        pendingOrders: 0,
        lowStockProductsCount: 0,
      },
      distributions: { bookings: [], orders: [] },
      salesHistory: [],
    },
    reports: { payments: [] },
    coupons: [],
    users: [],
    orders: [],
    pendingPayments: [],
    products: [],
    productsTotal: 0,
    productsTotalPages: 1,
    productsCurrentPage: 1,
    productsLoading: false,
    productActionLoading: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Overview stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Transaction reports
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })

      // Coupons CRUD
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })

      // Users directory
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx >= 0) {
          state.users[idx] = action.payload;
        }
      })

      // Orders List
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx >= 0) {
          state.orders[idx] = action.payload;
        }
      })

      // Pending payments
      .addCase(fetchPendingQrPayments.fulfilled, (state, action) => {
        state.pendingPayments = action.payload;
      })
      .addCase(verifyPaymentProof.fulfilled, (state, action) => {
        state.pendingPayments = state.pendingPayments.filter(
          (p) => p._id !== action.payload.paymentId
        );
      })

      // Admin Products Inventory
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products || [];
        state.productsTotal = action.payload.totalProducts || 0;
        state.productsTotalPages = action.payload.totalPages || 1;
        state.productsCurrentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload;
      })

      // Create Product
      .addCase(createAdminProduct.pending, (state) => {
        state.productActionLoading = true;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.productActionLoading = false;
        state.products.unshift(action.payload);
        state.productsTotal += 1;
      })
      .addCase(createAdminProduct.rejected, (state) => {
        state.productActionLoading = false;
      })

      // Update Product
      .addCase(updateAdminProduct.pending, (state) => {
        state.productActionLoading = true;
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        state.productActionLoading = false;
        const idx = state.products.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) {
          state.products[idx] = action.payload;
        }
      })
      .addCase(updateAdminProduct.rejected, (state) => {
        state.productActionLoading = false;
      })

      // Toggle Status
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) {
          state.products[idx] = action.payload;
        }
      })

      // Delete/Deactivate
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p._id === action.payload._id);
        if (idx >= 0) {
          state.products[idx] = action.payload;
        }
      });
  },
});

export default adminSlice.reducer;
