import apiClient from './httpInterceptor';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/v1';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  experience?: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

class AuthService {
  private _token: string | null = null;
  private _user: User | null = null;
  private _initialized: boolean = false;

  constructor() {
    // Initialize from localStorage
    this._token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        this._user = JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user_data');
      }
    }
  }

  // Initialize auth service
  async init(): Promise<boolean> {
    if (this._initialized) {
      return this.isAuthenticated();
    }

    try {
      this._initialized = true;
      
      // If we have a token, validate it by getting user profile
      if (this._token) {
        try {
          await this.getCurrentUser();
          return true;
        } catch (error) {
          // Token is invalid, clear it
          this.clearAuthData();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this._initialized = false;
      throw error;
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(`${API_BASE_URL}/users/login`, credentials);
      
      if (response.data.success) {
        this._token = response.data.data.token;
        this._user = response.data.data.user;
        
        // Store in localStorage
        localStorage.setItem('auth_token', this._token);
        localStorage.setItem('user_data', JSON.stringify(this._user));
        
        // Set token in axios defaults
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${this._token}`;
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(`${API_BASE_URL}/users`, userData);
      
      if (response.data.success) {
        // Auto-login after registration
        return await this.login({
          email: userData.email,
          password: userData.password
        });
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      if (this._token) {
        await apiClient.post(`${API_BASE_URL}/users/logout`);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    if (!this._token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await apiClient.get<{success: boolean; data: User}>(`${API_BASE_URL}/users/profile`);
      
      if (response.data.success) {
        this._user = response.data.data;
        localStorage.setItem('user_data', JSON.stringify(this._user));
        return this._user;
      }
      
      throw new Error('Failed to get user profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  }

  // Google OAuth login
  async loginWithGoogle(): Promise<void> {
    try {
      // Redirect to Google OAuth endpoint
      const googleOAuthUrl = `${API_BASE_URL}/auth/google`;
      window.location.href = googleOAuthUrl;
    } catch (error) {
      console.error('Google OAuth login failed:', error);
      throw new Error('Google login failed');
    }
  }

  // LinkedIn OAuth login
  async loginWithLinkedIn(): Promise<void> {
    try {
      // Redirect to LinkedIn OAuth endpoint
      const linkedInOAuthUrl = `${API_BASE_URL}/auth/linkedin`;
      window.location.href = linkedInOAuthUrl;
    } catch (error) {
      console.error('LinkedIn OAuth login failed:', error);
      throw new Error('LinkedIn login failed');
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(token: string, userData: User): Promise<void> {
    this._token = token;
    this._user = userData;
    
    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    
    // Set token in axios defaults
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this._token && !!this._user;
  }

  // Get user info
  getUserInfo(): User | null {
    return this._user;
  }

  // Get access token
  getToken(): string | undefined {
    return this._token || undefined;
  }

  // Check if user has role
  hasRole(role: string): boolean {
    return this._user?.role === role || false;
  }

  // Check if user has resource role (simplified for now)
  hasResourceRole(role: string, _resource: string): boolean {
    // For now, just check the user role
    // TODO: Implement resource-specific role checking
    return this.hasRole(role);
  }

  // Update token (for compatibility with existing code)
  async updateToken(_minValidity = 30): Promise<boolean> {
    try {
      // For JWT tokens, we might need to refresh them
      // For now, just validate the current token
      if (this._token) {
        await this.getCurrentUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token update failed:', error);
      return false;
    }
  }

  // Account management (redirect to profile page)
  accountManagement(): void {
    // For now, we can redirect to profile page or show a modal
    window.location.href = '/profile';
  }

  // Clear authentication data
  private clearAuthData(): void {
    this._token = null;
    this._user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Setup token refresh (for future JWT refresh token implementation)
  // private setupTokenRefresh(): void {
  //   // TODO: Implement JWT refresh token logic if needed
  //   // For now, we'll rely on backend session management
  // }
}

// Export singleton instance
export default new AuthService();
