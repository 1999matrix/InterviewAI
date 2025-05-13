import React, { createContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    // In a real app, you would make an API call to authenticate
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll just check if email contains "user"
    if (email.includes('user') || email.includes('test')) {
      const mockUser = {
        id: 'user-123',
        name: 'Demo User',
        email,
      };
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    } else {
      throw new Error('Invalid credentials');
    }
    
    setIsLoading(false);
  };
  
  const register = async (name: string, email: string, password: string) => {
    // In a real app, you would make an API call to register
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: `user-${Date.now()}`,
      name,
      email,
    };
    
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    
    setIsLoading(false);
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };