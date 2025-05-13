import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import InterviewLayout from '../pages/interview/InterviewLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import DemoPage from '../pages/DemoPage';
import PricingPage from '../pages/PricingPage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';

// Private Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import CreateSessionPage from '../pages/interview/CreateSessionPage';
import InterviewPage from '../pages/interview/InterviewPage';
import ProfilePage from '../pages/interview/ProfilePage';
import ResumeAnalyzerPage from '../pages/resume/ResumeAnalyzerPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create-session" element={<CreateSessionPage />} />
        <Route path="/interview/profile" element={<ProfilePage />} />
        <Route path="/interview/session" element={<InterviewPage />} />
        <Route path="/interview/schedule" element={<div>Schedule Mock Interview</div>} />
        <Route path="/interview/blogs" element={<div>Blogs</div>} />
        <Route path="/interview/affiliate" element={<div>Become Affiliate</div>} />
        <Route path="/interview/feedback" element={<div>Feedback</div>} />
        <Route path="/interview/contact" element={<div>Write to Us</div>} />
      </Route>
      
      {/* Interview Routes with Sidebar */}
      <Route element={<ProtectedRoute element={<InterviewLayout />} />}>
        <Route path="/resume" element={<ResumeAnalyzerPage />} />
        <Route path="/logout" element={<Navigate to="/login" />} />
      </Route>
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute element={<DashboardLayout />} />}>
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;