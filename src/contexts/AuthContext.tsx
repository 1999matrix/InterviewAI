import React, { createContext, useState, useEffect, useContext } from 'react';
// import KeycloakService from '../services/keycloak'; // Commented out for traditional auth

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
  // const [initializationAttempted, setInitializationAttempted] = useState(false);
  
  useEffect(() => {
    // Traditional auth initialization - commented out Keycloak
    // if (!initializationAttempted) {
    //   setInitializationAttempted(true);
    //   initializeKeycloak();
    // }
    setIsLoading(false); // Set loading to false since we're not using Keycloak
  }, []);
  
  // Commented out Keycloak methods
  // const initializeKeycloak = async () => {
  //   try {
  //     setIsLoading(true);
  //     const authenticated = await KeycloakService.init();
      
  //     if (authenticated) {
  //       await loadUserProfile();
  //       setIsAuthenticated(true);
  //     }
  //   } catch (error) {
  //     console.error('Keycloak initialization error:', error);
  //     setInitializationAttempted(false); // Allow retry on error
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  
  // const loadUserProfile = async () => {
  //   try {
  //     const userInfo = KeycloakService.getUserInfo();
  //     if (userInfo) {
  //       setUser(userInfo);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load user profile:', error);
  //   }
  // };
  
  const login = async () => {
    try {
      // Redirect to login page for traditional auth
      window.location.href = '/login';
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const register = async () => {
    try {
      // Redirect to register page for traditional auth
      window.location.href = '/signup';
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      // Traditional logout - will be handled by TraditionalAuthContext
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };
  
  const hasRole = (role: string) => {
    // Simple role check for traditional auth
    return user?.roles?.includes(role) || false;
  };
  
  const hasResourceRole = (role: string, resource: string) => {
    // Simple resource role check for traditional auth
    return user?.roles?.includes(role) || false;
  };
  
  const getToken = () => {
    // Return undefined for traditional auth (session-based)
    return undefined;
  };
  
  const updateToken = async (minValidity = 30) => {
    try {
      // No token refresh needed for session-based auth
      return false;
    } catch (error) {
      console.error('Token update failed:', error);
      throw error;
    }
  };
  
  const accountManagement = () => {
    // Redirect to profile page for traditional auth
    window.location.href = '/profile';
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