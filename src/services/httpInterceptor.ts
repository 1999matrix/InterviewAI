import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
// HTTP Interceptor for authentication
import AuthService from './authService';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/v1',
  timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      // Get current token from AuthService
      const token = AuthService.getToken();
      
      // Add token to headers if available
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Failed to add token in request interceptor:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshed = await AuthService.updateToken(0);
        
        if (refreshed) {
          // Get new token
          const newToken = AuthService.getToken();
          
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            return apiClient(originalRequest);
          }
        }
        
        // If refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication required'));
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Redirect to login if refresh fails
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 