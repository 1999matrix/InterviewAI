import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

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
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Private Pages
import DashboardPage from '../pages/dashboard/DashboardPage';
import CreateSessionPage from '../pages/interview/CreateSessionPage';
import InterviewPage from '../pages/interview/InterviewPage';
import ProfilePage from '../pages/interview/ProfilePage';
import ResumeAnalyzerPage from '../pages/resume/ResumeAnalyzerPage';
import CodingTestPage from '../pages/interview/CodingTestPage';
import AptitudeTestPage from '../pages/interview/AptitudeTestPage';
import CodingTestResultsPage from '../pages/interview/CodingTestResultsPage';

import Scheduler from '../pages/user/Scheduler';
import Profile from '../pages/user/Profile';
import WebSocketInterviewPage from '../pages/interview/WebSocketInterviewPage'; 

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
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

      </Route>
      
      {/* Protected Routes - Basic Authentication Required */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={
          // <ProtectedRoute>
            <DashboardPage />
          // </ProtectedRoute>
        } />
        <Route path="/create-session" element={
          // <ProtectedRoute>
            <CreateSessionPage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/websocket-session" element={
          <WebSocketInterviewPage />
        } />
        <Route path="/interview/create" element={
          // <ProtectedRoute>
            <CreateSessionPage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/home" element={
          // <ProtectedRoute>
            <ProfilePage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/profile" element={
          // <ProtectedRoute>
            <Profile />
          // </ProtectedRoute>
        } />
        <Route path="/interview/session" element={
          // <ProtectedRoute>
            <InterviewPage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/coding-test" element={
          // <ProtectedRoute>
            <CodingTestPage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/aptitude-test" element={
          // <ProtectedRoute>
            <AptitudeTestPage />
          // </ProtectedRoute>
        } />
        <Route path="/interview/results" element={
          // <ProtectedRoute>
            <CodingTestResultsPage />
          // </ProtectedRoute>
        } />
        {/* <Route path="/interview/schedule" element={
          <Scheduler />
        } /> */}
        <Route path="/interview/blogs" element={
          <ProtectedRoute>
            <div>Blogs</div>
          </ProtectedRoute>
        } />
        <Route path="/interview/affiliate" element={
          <ProtectedRoute>
            <div>Become Affiliate</div>
          </ProtectedRoute>
        } />
        <Route path="/interview/feedback" element={
          <ProtectedRoute>
            <div>Feedback</div>
          </ProtectedRoute>
        } />
        <Route path="/interview/contact" element={
          <ProtectedRoute>
            <div>Write to Us</div>
          </ProtectedRoute>
        } />
      <Route path="/resume" element={<ResumeAnalyzerPage />} />
      </Route>
      
      {/* Interview Routes with Sidebar - Role-based Protection */}
      <Route element={
        <ProtectedRoute roles={['user', 'premium-user']}>
          <InterviewLayout />
        </ProtectedRoute>
      }>
      </Route>
      
      {/* Admin Routes - Admin Role Required */}
      <Route element={
        <ProtectedRoute roles={['admin']} fallbackPath="/unauthorized">
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Add admin-specific routes here */}
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/admin/users" element={<div>User Management</div>} />
      </Route>
      
      {/* Premium Routes - Premium Role Required */}
      <Route element={<MainLayout />}>
        <Route path="/premium/features" element={
          <ProtectedRoute roles={['premium-user']} fallbackPath="/pricing">
            <div>Premium Features</div>
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Logout Route */}
      <Route path="/logout" element={<Navigate to="/login" />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;