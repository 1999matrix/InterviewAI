import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
// import { AuthContext } from '../../contexts/AuthContext'; // Commented out for traditional auth
import Button from '../../components/ui/Button';

const SignupPage: React.FC = () => {
  // Redirect to traditional signup page
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/traditional-signup', { replace: true });
  }, [navigate]);
  
  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  );
};

export default SignupPage;