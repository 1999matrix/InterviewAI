import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import KeycloakService from './keycloak';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7777/api',
  timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Check if token needs refresh
      await KeycloakService.updateToken(30);
      
      // Get current token
      const token = KeycloakService.getToken();
      
      // Add token to headers if available
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Failed to update token in request interceptor:', error);
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
        await KeycloakService.updateToken(0);
        
        // Get new token
        const newToken = KeycloakService.getToken();
        
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Redirect to login if refresh fails
        KeycloakService.login();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 