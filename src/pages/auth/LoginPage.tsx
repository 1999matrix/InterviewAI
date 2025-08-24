import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // Commented out for traditional auth
import Button from '../../components/ui/Button';

const LoginPage: React.FC = () => {
  // Commented out Keycloak auth for traditional auth
  // const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to traditional login page
  useEffect(() => {
    navigate('/traditional-login', { replace: true, state: location.state });
  }, [navigate, location.state]);
  
  // Fallback handlers for Keycloak buttons (redirects to traditional auth)
  const handleLogin = async () => {
    try {
      navigate('/traditional-login');
    } catch (error) {
      console.error('Login redirect failed:', error);
    }
  };
  
  const handleRegister = async () => {
    try {
      navigate('/traditional-signup');
    } catch (error) {
      console.error('Registration redirect failed:', error);
    }
  };
  
  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default LoginPage;