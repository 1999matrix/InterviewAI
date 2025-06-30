# Keycloak Troubleshooting Guide

## 🚨 Common Errors and Solutions

### 1. "A 'Keycloak' instance can only be initialized once" Error

**Problem**: Keycloak is being initialized multiple times, often due to React StrictMode in development.

**Solution**: ✅ **FIXED** - Added initialization guard in `KeycloakService`

### 2. "Web Crypto API is not available" Error

**Problem**: Keycloak requires a secure context (HTTPS) for PKCE authentication.

**Solutions**:

#### Option A: Use HTTPS (Recommended)
```bash
# Generate SSL certificates for local development
npm run generate-certs

# Run with HTTPS
npm run setup-https
```

#### Option B: Use localhost (Secure Context)
```bash
# Run on localhost (considered secure by browsers)
npm run dev:https
```

#### Option C: Disable PKCE (Development Only)
The configuration has been updated to automatically disable PKCE when Web Crypto API is not available.

### 3. "Timeout when waiting for 3rd party check iframe message" Error

**Problem**: Keycloak server is not running or not accessible.

**Solutions**:
1. **Start Keycloak Server**: Make sure Keycloak is running on the configured URL
2. **Check Configuration**: Verify your `.env` file has correct Keycloak settings
3. **Network Issues**: Ensure no firewall is blocking the connection

## 🔧 Setup Instructions

### 1. Create Environment File
Copy the example and update with your values:
```bash
# Create .env file with these variables:
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=your-realm-name
VITE_KEYCLOAK_CLIENT_ID=your-client-id
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Keycloak Server Setup
1. Download and run Keycloak server
2. Create a realm (or use 'master')
3. Create a client with:
   - Client ID: match your `VITE_KEYCLOAK_CLIENT_ID`
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:5173/*` (or your dev server URL)

### 3. Development Modes

#### Standard HTTP (May have Web Crypto limitations)
```bash
npm run dev
```

#### HTTPS with Self-Signed Certificates
```bash
npm run setup-https
```

#### Localhost (Secure Context)
```bash
npm run dev:https
```

## 🐛 Debugging

### Enable Keycloak Logging
The configuration now includes `enableLogging: true` for better debugging.

### Check Browser Console
Look for these helpful messages:
- ✅ "Keycloak Development Mode" - Shows configuration
- ⚠️ "Web Crypto API not available" - HTTPS needed
- ⚠️ "Keycloak server might not be running" - Check server

### Network Tab
Check if requests to Keycloak server are failing (404, timeout, CORS issues).

## 🎯 Quick Fixes

### For Development Without Keycloak Server
If you don't have a Keycloak server running, you can temporarily:

1. Comment out Keycloak initialization in `AuthContext.tsx`
2. Use mock authentication for development
3. Set up a local Keycloak instance using Docker:

```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

## 📚 Additional Resources

- [Keycloak JavaScript Adapter Documentation](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter)
- [Web Crypto API MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Vite HTTPS Configuration](https://vitejs.dev/config/server-options.html#server-https) 