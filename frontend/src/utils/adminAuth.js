/**
 * Admin Authentication Utility
 * Handles secure admin authentication via backend API
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
const TOKEN_STORAGE_KEY = 'admin_token';
const TOKEN_EXPIRY_KEY = 'admin_token_expiry';

/**
 * Login to admin dashboard (Step 1: Password verification)
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, requiresMFA?: boolean, mfaToken?: string, token?: string, error?: string}>}
 */
export const adminLogin = async (password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      if (data.requiresMFA && data.mfaToken) {
        // MFA is required - return MFA token for verification
        return { 
          success: true, 
          requiresMFA: true, 
          mfaToken: data.mfaToken,
          message: data.message || 'Password verified. Please enter your MFA code.'
        };
      } else if (data.token) {
        // No MFA required - store token directly
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        if (data.expiresAt) {
          localStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt.toString());
        }
        return { success: true, token: data.token };
      }
    }
    
    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

/**
 * Verify MFA code (Step 2: MFA verification)
 * @param {string} mfaToken - Temporary MFA verification token from login
 * @param {string} mfaCode - 6-digit TOTP code from authenticator app
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const verifyMFA = async (mfaToken, mfaCode) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/verify-mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mfaToken, mfaCode })
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Store token securely
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      if (data.expiresAt) {
        localStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt.toString());
      }
      return { success: true, token: data.token };
    } else {
      return { success: false, error: data.error || 'MFA verification failed' };
    }
  } catch (error) {
    console.error('MFA verification error:', error);
    return { success: false, error: 'Network error. Please check your connection.' };
  }
};

/**
 * Get stored admin token
 * @returns {string|null}
 */
export const getAdminToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Check if admin is authenticated
 * @returns {Promise<boolean>}
 */
export const checkAdminAuth = async () => {
  const token = getAdminToken();
  if (!token) {
    return false;
  }

  // Check if token is expired
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (expiry && parseInt(expiry) < Date.now()) {
    logout();
    return false;
  }

  // Verify token with backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-admin-token': token
      }
    });

    const data = await response.json();
    return data.success && data.valid === true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

/**
 * Logout from admin dashboard
 */
export const logout = async () => {
  const token = getAdminToken();
  
  // Notify backend (optional, non-blocking)
  if (token) {
    try {
      await fetch(`${BACKEND_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Clear local storage
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Get authorization headers for admin API requests
 * @returns {Object} Headers object with authorization
 */
export const getAdminHeaders = () => {
  const token = getAdminToken();
  if (!token) {
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`,
    'x-admin-token': token
  };
};

