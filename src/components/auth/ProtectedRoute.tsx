import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  resourceRoles?: { role: string; resource: string }[];
  fallbackPath?: string;
  requireAllRoles?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
  resourceRoles = [],
  fallbackPath = '/login',
  requireAllRoles = false,
}) => {
  const { isAuthenticated, isLoading, hasRole, hasResourceRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0) {
    const roleCheck = requireAllRoles
      ? roles.every(role => hasRole(role))
      : roles.some(role => hasRole(role));

    if (!roleCheck) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check resource role-based access
  if (resourceRoles.length > 0) {
    const resourceRoleCheck = requireAllRoles
      ? resourceRoles.every(({ role, resource }) => hasResourceRole(role, resource))
      : resourceRoles.some(({ role, resource }) => hasResourceRole(role, resource));

    if (!resourceRoleCheck) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 