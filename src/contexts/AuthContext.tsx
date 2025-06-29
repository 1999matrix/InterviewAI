import React, { createContext, useState, useEffect, useContext } from 'react';
import KeycloakService from '../services/keycloak';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
  groups: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasResourceRole: (role: string, resource: string) => boolean;
  getToken: () => string | undefined;
  updateToken: (minValidity?: number) => Promise<boolean>;
  accountManagement: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  hasRole: () => false,
  hasResourceRole: () => false,
  getToken: () => undefined,
  updateToken: async () => false,
  accountManagement: () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    initializeKeycloak();
  }, []);
  
  const initializeKeycloak = async () => {
    try {
      setIsLoading(true);
      const authenticated = await KeycloakService.init();
      
      if (authenticated) {
        await loadUserProfile();
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Keycloak initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadUserProfile = async () => {
    try {
      const userInfo = KeycloakService.getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };
  
  const login = async () => {
    try {
      await KeycloakService.login();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const register = async () => {
    try {
      await KeycloakService.register();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      await KeycloakService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };
  
  const hasRole = (role: string) => {
    return KeycloakService.hasRole(role);
  };
  
  const hasResourceRole = (role: string, resource: string) => {
    return KeycloakService.hasResourceRole(role, resource);
  };
  
  const getToken = () => {
    return KeycloakService.getToken();
  };
  
  const updateToken = async (minValidity = 30) => {
    try {
      return await KeycloakService.updateToken(minValidity);
    } catch (error) {
      console.error('Token update failed:', error);
      throw error;
    }
  };
  
  const accountManagement = () => {
    KeycloakService.accountManagement();
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      hasRole,
      hasResourceRole,
      getToken,
      updateToken,
      accountManagement,
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