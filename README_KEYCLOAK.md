# Keycloak Integration for React Application

This document provides a comprehensive overview of the Keycloak integration implemented in this React application.

## 🚀 Features Implemented

### ✅ Core Authentication
- **Keycloak JavaScript Adapter**: Full integration with keycloak-js
- **Automatic Token Management**: Tokens are automatically refreshed before expiration
- **Silent Authentication**: Check authentication status without redirecting users
- **Secure Logout**: Proper logout with token invalidation

### ✅ Authorization & Access Control
- **Role-Based Access Control (RBAC)**: Protect routes based on user roles
- **Resource-Based Permissions**: Support for resource-specific roles
- **Protected Routes**: Multiple levels of route protection
- **Conditional UI Rendering**: Show/hide UI elements based on user permissions

### ✅ User Experience
- **Seamless Integration**: Works with existing React Router setup
- **Loading States**: Proper loading indicators during authentication
- **Error Handling**: Comprehensive error handling and user feedback
- **Account Management**: Direct integration with Keycloak account management

### ✅ Developer Experience
- **TypeScript Support**: Full TypeScript integration with proper types
- **HTTP Interceptor**: Automatic token injection for API calls
- **Environment Configuration**: Easy configuration via environment variables
- **Comprehensive Documentation**: Detailed setup and usage guides

## 📁 File Structure

```
src/
├── services/
│   ├── keycloak.ts              # Keycloak service singleton
│   └── httpInterceptor.ts       # Axios interceptor for API calls
├── contexts/
│   └── AuthContext.tsx          # Updated auth context with Keycloak
├── components/
│   └── auth/
│       ├── ProtectedRoute.tsx   # Route protection component
│       └── UserProfile.tsx      # User profile display component
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx        # Updated login page
│   │   └── UnauthorizedPage.tsx # Unauthorized access page
│   └── KeycloakTestPage.tsx     # Test page for integration
└── routes/
    └── index.tsx                # Updated routes with protection
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=your-realm-name
VITE_KEYCLOAK_CLIENT_ID=your-client-id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
```

### Keycloak Service Configuration

The Keycloak service (`src/services/keycloak.ts`) provides:

- **Initialization**: Automatic initialization with configurable options
- **Authentication Methods**: Login, logout, register
- **Token Management**: Get, refresh, and validate tokens
- **User Information**: Access user profile and roles
- **Role Checking**: Check user roles and permissions

## 🛡️ Security Features

### PKCE (Proof Key for Code Exchange)
- Enabled by default for enhanced security
- Protects against authorization code interception attacks

### Token Refresh Strategy
- Automatic token refresh every 30 seconds
- Configurable minimum validity period
- Graceful handling of refresh failures

### HTTP Security
- Automatic Bearer token injection for API calls
- Token refresh on 401 responses
- Proper error handling and retry logic

## 🎯 Usage Examples

### Basic Authentication Check

```tsx
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Protected Routes

```tsx
// Basic protection (requires authentication)
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-based protection
<Route path="/admin" element={
  <ProtectedRoute roles={['admin']}>
    <AdminPanel />
  </ProtectedRoute>
} />

// Multiple roles (user needs ANY of these roles)
<Route path="/premium" element={
  <ProtectedRoute roles={['premium-user', 'admin']}>
    <PremiumFeatures />
  </ProtectedRoute>
} />

// Multiple roles (user needs ALL of these roles)
<Route path="/super-admin" element={
  <ProtectedRoute roles={['admin', 'super-user']} requireAllRoles={true}>
    <SuperAdminPanel />
  </ProtectedRoute>
} />
```

### Role-based UI Components

```tsx
import { useAuth } from '../contexts/AuthContext';

const NavigationMenu = () => {
  const { hasRole } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      {hasRole('admin') && <Link to="/admin">Admin Panel</Link>}
      {hasRole('premium-user') && <Link to="/premium">Premium Features</Link>}
    </nav>
  );
};
```

### API Calls with Authentication

```tsx
import apiClient from '../services/httpInterceptor';

// The interceptor automatically adds the Bearer token
const fetchUserData = async () => {
  try {
    const response = await apiClient.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    // Token refresh is handled automatically
  }
};
```

## 🧪 Testing the Integration

Visit `/keycloak-test` in your application to access a comprehensive test page that demonstrates:

- User authentication status
- User profile information
- Role-based access control
- Token information
- Account management integration

## 🔄 Migration from Existing Auth

If you're migrating from an existing authentication system:

1. **Update Components**: Replace `AuthContext` imports with `useAuth` hook
2. **Update Login Logic**: Remove form-based login, use Keycloak methods
3. **Update Route Protection**: Replace existing guards with `ProtectedRoute`
4. **Update API Calls**: Use the provided HTTP interceptor
5. **Test Thoroughly**: Use the test page to verify all functionality

## 🚨 Common Issues & Solutions

### CORS Errors
- Ensure Keycloak client has correct web origins configured
- Add your development and production URLs to valid redirect URIs

### Token Refresh Failures
- Check token lifetime settings in Keycloak
- Verify refresh token configuration
- Ensure proper error handling in your API

### Role Mapping Issues
- Verify roles are properly assigned to users in Keycloak
- Check role mapping configuration in client settings
- Ensure role names match exactly in your code

### Redirect Loops
- Verify redirect URIs in Keycloak client configuration
- Check for conflicting route protections
- Ensure proper fallback paths are configured

## 📚 Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak JavaScript Adapter Guide](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter)
- [OAuth 2.0 and OpenID Connect](https://oauth.net/2/)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)

## 🔧 Development Commands

```bash
# Install dependencies (keycloak-js should already be installed)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 🌟 Best Practices Implemented

1. **Security First**: PKCE enabled, short token lifetimes, proper logout
2. **User Experience**: Loading states, error handling, seamless navigation
3. **Developer Experience**: TypeScript support, comprehensive documentation
4. **Maintainability**: Modular architecture, separation of concerns
5. **Scalability**: Role-based access control, configurable permissions

## 📝 Next Steps

After setting up Keycloak integration, consider:

1. **Backend Integration**: Secure your API endpoints with Keycloak
2. **Advanced Roles**: Implement fine-grained permissions
3. **Social Login**: Configure social identity providers in Keycloak
4. **Multi-tenancy**: Set up multiple realms for different environments
5. **Monitoring**: Implement logging and monitoring for authentication events

---

**Note**: This integration provides a production-ready authentication solution with Keycloak. Make sure to properly configure your Keycloak server and update the environment variables before deploying to production. 