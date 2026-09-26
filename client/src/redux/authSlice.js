import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Async Thunk: Handles User Registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', formData);
      return response.data.data; // Expected response shape: { user, accessToken }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Async Thunk: Handles User Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async Thunk: Handles User Logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000; // 48 hours session duration limit

const updateSessionTimestamp = () => {
  try {
    localStorage.setItem('sparkcare_last_active', Date.now().toString());
  } catch (err) {
    console.warn('Failed to save session timestamp', err);
  }
};

const clearSessionTimestamp = () => {
  try {
    localStorage.removeItem('sparkcare_last_active');
  } catch (err) {
    console.warn('Failed to clear session timestamp', err);
  }
};

const isSessionExpired = () => {
  try {
    const lastActiveStr = localStorage.getItem('sparkcare_last_active');
    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (!isNaN(lastActive) && Date.now() - lastActive > TWO_DAYS_MS) {
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed to verify session timestamp', err);
  }
  return false;
};

// Async Thunk: Silent status check on boot (verifies active cookie session & 2-day timeout)
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      if (sessionStorage.getItem('sparkcare_logged_out') === '1') {
        clearSessionTimestamp();
        return rejectWithValue(null);
      }
      if (isSessionExpired()) {
        await api.post('/auth/logout').catch(() => {});
        clearSessionTimestamp();
        sessionStorage.setItem('sparkcare_logged_out', '1');
        return rejectWithValue('Session expired after 2 days of inactivity.');
      }
      const response = await api.post('/auth/refresh');
      sessionStorage.removeItem('sparkcare_logged_out');
      updateSessionTimestamp();
      return response.data.data;
    } catch {
      clearSessionTimestamp();
      return rejectWithValue(null);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false, // Prevents layout flashing on initial boot selfcheck
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserInState: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    touchSession: () => {
      updateSessionTimestamp();
    },
    forceLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      clearSessionTimestamp();
      sessionStorage.setItem('sparkcare_logged_out', '1');
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        sessionStorage.removeItem('sparkcare_logged_out');
        updateSessionTimestamp();
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        sessionStorage.removeItem('sparkcare_logged_out');
        updateSessionTimestamp();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout - purge state unconditionally on fulfilled or rejected
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        clearSessionTimestamp();
        sessionStorage.setItem('sparkcare_logged_out', '1');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        clearSessionTimestamp();
        sessionStorage.setItem('sparkcare_logged_out', '1');
      })
      
      // Check Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.isInitialized = true;
        sessionStorage.removeItem('sparkcare_logged_out');
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isInitialized = true;
      });
  },
});

export const { clearError, updateUserInState, touchSession, forceLogout } = authSlice.actions;
export default authSlice.reducer;
