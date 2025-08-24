import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService, { User, RegisterData, LoginData } from '../services/authService';

interface TraditionalAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGitHub: () => void;
  refreshUser: () => Promise<void>;
}

const TraditionalAuthContext = createContext<TraditionalAuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  loginWithGoogle: () => {},
  loginWithGitHub: () => {},
  refreshUser: async () => {},
});

interface TraditionalAuthProviderProps {
  children: ReactNode;
}

export const TraditionalAuthProvider: React.FC<TraditionalAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Check for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    
    if (authSuccess === 'success') {
      // OAuth callback successful, refresh user data
      refreshUser();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is stored locally and session is valid
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        // Verify with server
        const authStatus = await authService.checkAuthStatus();
        if (authStatus.authenticated && authStatus.user) {
          setUser(authStatus.user);
          setIsAuthenticated(true);
        } else {
          // Clear invalid session
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear potentially corrupted session
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  const loginWithGoogle = () => {
    const googleUrl = authService.getGoogleLoginUrl();
    window.location.href = googleUrl;
  };

  const loginWithGitHub = () => {
    const githubUrl = authService.getGitHubLoginUrl();
    window.location.href = githubUrl;
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('User refresh error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: TraditionalAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loginWithGoogle,
    loginWithGitHub,
    refreshUser,
  };

  return (
    <TraditionalAuthContext.Provider value={value}>
      {children}
    </TraditionalAuthContext.Provider>
  );
};

// Custom hook to use traditional auth context
export const useTraditionalAuth = () => {
  const context = useContext(TraditionalAuthContext);
  if (context === undefined) {
    throw new Error('useTraditionalAuth must be used within a TraditionalAuthProvider');
  }
  return context;
};

export { TraditionalAuthContext };
