import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/auth/UserProfile';
import Button from '../components/ui/Button';

const KeycloakTestPage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    hasRole, 
    getToken, 
    accountManagement 
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Keycloak Test Page</h1>
          <p className="text-gray-600 text-center mb-6">
            You need to be authenticated to view this page.
          </p>
          <Button onClick={login} fullWidth>
            Login with Keycloak
          </Button>
        </div>
      </div>
    );
  }

  const token = getToken();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Keycloak Integration Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile */}
          <div>
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <UserProfile showRoles={true} />
          </div>
          
          {/* Authentication Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authentication Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  isAuthenticated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <p className="text-sm text-gray-900 font-mono">{user?.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token (First 50 chars)
                </label>
                <p className="text-sm text-gray-900 font-mono break-all">
                  {token ? `${token.substring(0, 50)}...` : 'No token'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Role Testing */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Role-Based Access Testing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">User Role</h3>
              <p className="text-sm text-gray-600 mb-3">
                Basic user access
              </p>
              {hasRole('user') ? (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Access Granted
                </span>
              ) : (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  ✗ Access Denied
                </span>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Premium User Role</h3>
              <p className="text-sm text-gray-600 mb-3">
                Premium features access
              </p>
              {hasRole('premium-user') ? (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Access Granted
                </span>
              ) : (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  ✗ Access Denied
                </span>
              )}
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Admin Role</h3>
              <p className="text-sm text-gray-600 mb-3">
                Administrative access
              </p>
              {hasRole('admin') ? (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  ✓ Access Granted
                </span>
              ) : (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  ✗ Access Denied
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button onClick={accountManagement} variant="outline">
              Manage Account
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeycloakTestPage; 