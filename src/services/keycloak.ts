  import Keycloak from 'keycloak-js';

// Keycloak configuration
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080', // Your Keycloak server URL
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'your-realm', // Your realm name
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'your-client-id', // Your client ID
};

// Initialize Keycloak instance
const keycloak = new Keycloak(keycloakConfig);

// Keycloak initialization options
const initOptions = {
  onLoad: 'check-sso' as const, // Options: 'check-sso', 'login-required'
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  checkLoginIframe: false, // Disable iframe check for better performance
  pkceMethod: 'S256' as const, // Use PKCE for better security
};

class KeycloakService {
  private _keycloak: Keycloak;

  constructor() {
    this._keycloak = keycloak;
  }

  get keycloak() {
    return this._keycloak;
  }

  // Initialize Keycloak
  async init(): Promise<boolean> {
    try {
      const authenticated = await this._keycloak.init(initOptions);
      
      // Set up token refresh
      this.setupTokenRefresh();
      
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      throw error;
    }
  }

  // Login
  login() {
    return this._keycloak.login();
  }

  // Logout
  logout() {
    return this._keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  // Register
  register() {
    return this._keycloak.register();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this._keycloak.token;
  }

  // Get user profile
  getUserProfile() {
    return this._keycloak.loadUserProfile();
  }

  // Get user info from token
  getUserInfo() {
    if (!this._keycloak.tokenParsed) return null;
    
    return {
      id: this._keycloak.tokenParsed.sub || '',
      name: this._keycloak.tokenParsed.name || this._keycloak.tokenParsed.preferred_username || '',
      email: this._keycloak.tokenParsed.email || '',
      username: this._keycloak.tokenParsed.preferred_username || '',
      roles: this._keycloak.tokenParsed.realm_access?.roles || [],
      groups: this._keycloak.tokenParsed.groups || [],
    };
  }

  // Get access token
  getToken() {
    return this._keycloak.token;
  }

  // Get refresh token
  getRefreshToken() {
    return this._keycloak.refreshToken;
  }

  // Check if user has role
  hasRole(role: string) {
    return this._keycloak.hasRealmRole(role);
  }

  // Check if user has resource role
  hasResourceRole(role: string, resource: string) {
    return this._keycloak.hasResourceRole(role, resource);
  }

  // Update token
  async updateToken(minValidity = 30) {
    try {
      const refreshed = await this._keycloak.updateToken(minValidity);
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  // Setup automatic token refresh
  private setupTokenRefresh() {
    // Refresh token every 30 seconds if it expires within 60 seconds
    setInterval(async () => {
      try {
        await this.updateToken(60);
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Token refresh failed, user needs to login again
        this.login();
      }
    }, 30000);
  }

  // Account management
  accountManagement() {
    return this._keycloak.accountManagement();
  }

  // Get login URL
  createLoginUrl(options?: any) {
    return this._keycloak.createLoginUrl(options);
  }

  // Get logout URL
  createLogoutUrl(options?: any) {
    return this._keycloak.createLogoutUrl(options);
  }

  // Get register URL
  createRegisterUrl(options?: any) {
    return this._keycloak.createRegisterUrl(options);
  }
}

// Export singleton instance
export default new KeycloakService(); 