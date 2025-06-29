import React from 'react';
import { User, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  showRoles?: boolean;
  compact?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  showRoles = false, 
  compact = false 
}) => {
  const { user, logout, accountManagement } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAccountManagement = () => {
    accountManagement();
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
          {user.username && (
            <p className="text-sm text-gray-500 truncate">
              @{user.username}
            </p>
          )}
        </div>
      </div>

      {showRoles && user.roles.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-1" />
            Roles & Permissions
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.groups.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Groups</h3>
          <div className="flex flex-wrap gap-2">
            {user.groups.map((group) => (
              <span
                key={group}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {group}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleAccountManagement}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Account
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 