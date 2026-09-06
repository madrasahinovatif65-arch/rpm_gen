// SIAKAD SSO Authentication Client Library
// Handles OAuth2 authorization code flow integration with SIAKAD server

/**
 * Configuration for SIAKAD OAuth2 authentication
 */
export interface SiakadAuthConfig {
  authUrl: string;          // SIAKAD /authorize endpoint
  tokenUrl: string;         // SIAKAD /token endpoint
  clientId: string;         // App client ID registered in SIAKAD
  redirectUri: string;      // Callback URL (app's /auth/callback)
  timeout?: number;         // Connection timeout in ms (default 10000)
}

/**
 * User profile data from SIAKAD
 */
export interface SiakadUserProfile {
  id: string;               // Guru ID from SIAKAD
  nama: string;
  nip?: string;
  mataPelajaran?: string;
  sekolah?: string;
}

/**
 * Token response from SIAKAD OAuth2 server
 */
export interface SiakadTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  user: SiakadUserProfile;
}

/**
 * Get SIAKAD configuration from environment variables
 */
function getSiakadConfig(): SiakadAuthConfig {
  return {
    authUrl: import.meta.env.VITE_SIAKAD_AUTH_URL || 'http://localhost:3001/oauth/authorize',
    tokenUrl: import.meta.env.VITE_SIAKAD_TOKEN_URL || 'http://localhost:3001/oauth/token',
    clientId: import.meta.env.VITE_SIAKAD_CLIENT_ID || 'apk_gen_client',
    redirectUri: import.meta.env.VITE_SIAKAD_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    timeout: 10000 // 10 seconds
  };
}

/**
 * Check if running in mock mode
 */
function isMockMode(): boolean {
  return import.meta.env.VITE_SIAKAD_MOCK_MODE === 'true';
}

/**
 * Generate random state string for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Initiate SSO login flow by redirecting to SIAKAD authorize endpoint
 */
export function redirectToSiakadLogin(): void {
  const config = getSiakadConfig();
  
  // Generate and store CSRF state
  const state = generateState();
  sessionStorage.setItem('siakad_oauth_state', state);
  
  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state: state
  });
  
  const authUrl = `${config.authUrl}?${params.toString()}`;
  
  console.log('🔐 Redirecting to SIAKAD login:', authUrl);
  window.location.href = authUrl;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<SiakadTokenResponse> {
  const config = getSiakadConfig();
  
  // Mock mode: return mock response
  if (isMockMode()) {
    console.log('🎭 Mock mode: simulating token exchange');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
      user: {
        id: 'guru001',
        nama: 'Budi Santoso, S.Pd. (MOCK)',
        nip: '197805122005011003',
        mataPelajaran: 'Matematika',
        sekolah: 'SMP Negeri 3 Kerinci'
      }
    };
  }
  
  // Real implementation
  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: config.clientId,
        redirect_uri: config.redirectUri
      }),
      signal: AbortSignal.timeout(config.timeout || 10000)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'unknown_error' }));
      throw new Error(`Token exchange failed: ${errorData.error || response.statusText}`);
    }
    
    const data: SiakadTokenResponse = await response.json();
    console.log('✅ Token exchange successful');
    return data;
    
  } catch (error: any) {
    console.error('❌ Token exchange error:', error);
    
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('SIAKAD server tidak merespons. Gunakan login lokal sebagai fallback.');
    }
    
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<SiakadTokenResponse> {
  const config = getSiakadConfig();
  
  // Mock mode: return new mock token
  if (isMockMode()) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      access_token: `mock_token_refreshed_${Date.now()}`,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: 'Bearer',
      user: {
        id: 'guru001',
        nama: 'Budi Santoso, S.Pd. (MOCK)',
        nip: '197805122005011003',
        mataPelajaran: 'Matematika',
        sekolah: 'SMP Negeri 3 Kerinci'
      }
    };
  }
  
  // Real implementation
  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId
    }),
    signal: AbortSignal.timeout(config.timeout || 10000)
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  return response.json();
}

/**
 * Check if SIAKAD server is reachable and healthy
 */
export async function checkSiakadHealth(): Promise<boolean> {
  // Mock mode: always healthy
  if (isMockMode()) {
    return true;
  }
  
  const config = getSiakadConfig();
  
  try {
    // Try to reach the auth URL (just check if server responds)
    const healthUrl = config.authUrl.replace('/oauth/authorize', '/health');
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // Shorter timeout for health check
    });
    
    return response.ok;
    
  } catch (error) {
    console.warn('⚠️ SIAKAD health check failed:', error);
    return false;
  }
}

/**
 * Validate OAuth state for CSRF protection
 */
export function validateState(receivedState: string): boolean {
  const storedState = sessionStorage.getItem('siakad_oauth_state');
  
  if (!storedState) {
    console.error('❌ No stored OAuth state found');
    return false;
  }
  
  if (storedState !== receivedState) {
    console.error('❌ OAuth state mismatch - possible CSRF attack');
    return false;
  }
  
  // Clear state after validation
  sessionStorage.removeItem('siakad_oauth_state');
  return true;
}

/**
 * Clear OAuth state (for cleanup on errors)
 */
export function clearOAuthState(): void {
  sessionStorage.removeItem('siakad_oauth_state');
}
