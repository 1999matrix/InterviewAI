import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService, { User, LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasResourceRole: (role: string, resource: string) => boolean;
  getToken: () => string | undefined;
  updateToken: (minValidity?: number) => Promise<boolean>;
  accountManagement: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginWithLinkedIn: async () => {},
  hasRole: () => false,
  hasResourceRole: () => false,
  getToken: () => undefined,
  updateToken: async () => false,
  accountManagement: () => {},
  refreshUser: async () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  useEffect(() => {
    // Prevent multiple initialization attempts
    if (!initializationAttempted) {
      setInitializationAttempted(true);
      initializeAuth();
    }
  }, [initializationAttempted]);

  // Check for OAuth callback in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('OAuth authentication failed:', error);
      // Remove error param from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      return;
    }
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        AuthService.handleOAuthCallback(token, parsedUser);
        
        // Remove OAuth params from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Reload auth state
        loadUserProfile();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('OAuth callback handling failed:', error);
      }
    }
  }, []);
  
  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.init();
      
      if (authenticated) {
        await loadUserProfile();
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setInitializationAttempted(false); // Allow retry on error
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUserProfile = async () => {
    try {
      const userInfo = AuthService.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        // Try to fetch fresh user data
        const freshUser = await AuthService.getCurrentUser();
        setUser(freshUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };
  
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await AuthService.loginWithGoogle();
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const loginWithLinkedIn = async () => {
    try {
      await AuthService.loginWithLinkedIn();
    } catch (error) {
      console.error('LinkedIn login failed:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on backend, clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await AuthService.getCurrentUser();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might be logged out
      await logout();
    }
  };
  
  const hasRole = (role: string) => {
    return AuthService.hasRole(role);
  };
  
  const hasResourceRole = (role: string, resource: string) => {
    return AuthService.hasResourceRole(role, resource);
  };
  
  const getToken = () => {
    return AuthService.getToken();
  };
  
  const updateToken = async (minValidity = 30) => {
    try {
      return await AuthService.updateToken(minValidity);
    } catch (error) {
      console.error('Token update failed:', error);
      return false;
    }
  };
  
  const accountManagement = () => {
    AuthService.accountManagement();
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      loginWithGoogle,
      loginWithLinkedIn,
      hasRole,
      hasResourceRole,
      getToken,
      updateToken,
      accountManagement,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, AuthContext };