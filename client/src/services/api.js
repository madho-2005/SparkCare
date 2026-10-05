import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Centered Axios Network Client.
 * Leverages secure withCredentials parameters to auto-transceive cookies.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Auto-send HttpOnly tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to coordinate multiple parallel refreshes safely
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Catches session expirations and dynamically requests silent token rotation
api.interceptors.response.use(
  (response) => {
    // Detect when an API endpoint was routed to the frontend SPA HTML (e.g. Vercel SPA rewrite fallback)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype html>') ||
       response.data.trim().startsWith('<!DOCTYPE html>') ||
       response.data.trim().startsWith('<html'))
    ) {
      const targetUrl = response.config?.url || 'API';
      const errorMsg = `API request to "${targetUrl}" returned an HTML document instead of JSON. ` +
        `This happens when VITE_API_BASE_URL is not set to your live backend server in Vercel Environment Variables.`;
      return Promise.reject(new Error(errorMsg));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/refresh') ||
                        originalRequest.url?.includes('/auth/logout');

    const isExplicitlyLoggedOut = sessionStorage.getItem('sparkcare_logged_out') === '1';

    // Verify if error is 401 Unauthorized and not already retrying (and not an auth route itself)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute && !isExplicitlyLoggedOut) {
      // If we are currently rotating tokens, queue this request to execute once completed
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger token refresh rotation endpoint
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null); // Clear pending queue
        
        return api(originalRequest); // Retry original failed request
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Refresh token failed: User session completely dead. Mark logged out.
        sessionStorage.setItem('sparkcare_logged_out', '1');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
