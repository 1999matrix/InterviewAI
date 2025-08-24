import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_APP_CORE_API || 'http://localhost:8081/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use( 
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      Cookies.remove('auth_token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  provider: 'local' | 'google' | 'github' | 'keycloak';
  profile_picture?: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Traditional registration
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', data);
      const { user, token } = response.data;
      
      if (user) {
        this.setUserSession(user, token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Traditional login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, token } = response.data;
      
      if (user) {
        this.setUserSession(user, token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local data
      console.error('Logout error:', error);
    } finally {
      this.clearUserSession();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  // Check authentication status
  async checkAuthStatus(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      return { authenticated: false };
    }
  }

  // OAuth login URLs
  getGoogleLoginUrl(): string {
    return `${API_BASE_URL}/auth/google`;
  }

  getGitHubLoginUrl(): string {
    return `${API_BASE_URL}/auth/github`;
  }

  // Set user session
  private setUserSession(user: User, token?: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) {
      Cookies.set('auth_token', token, { 
        expires: 7, // 7 days
        secure: import.meta.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
  }

  // Clear user session
  private clearUserSession(): void {
    localStorage.removeItem('user');
    Cookies.remove('auth_token');
  }

  // Get stored user
  getStoredUser(): User | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const user = this.getStoredUser();
    const token = Cookies.get('auth_token');
    return !!(user && (token || user.provider !== 'local'));
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put('/users/profile', data);
      const updatedUser = response.data.user;
      
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = this.getStoredUser();
      if (!user) throw new Error('User not found');
      
      await apiClient.post(`/users/${user.id}/change-password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }
}

export default new AuthService();
