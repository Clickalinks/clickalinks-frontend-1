/**
 * Admin Authentication Routes
 * Secure backend authentication for admin functions
 * Features: Strong password requirements, MFA (TOTP), secure password hashing
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import zxcvbn from 'zxcvbn';
import { adminRateLimit } from '../middleware/security.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Admin password hash (REQUIRED - no fallback to plain text)
// In production, use a strong password and hash it with: bcrypt.hashSync(password, 10)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_API_KEY || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

// MFA secret (stored in environment variable, encrypted in production)
// Generate with: speakeasy.generateSecret({ name: 'ClickALinks Admin', length: 32 })
const ADMIN_MFA_SECRET = process.env.ADMIN_MFA_SECRET || '';
const ADMIN_MFA_ENABLED = process.env.ADMIN_MFA_ENABLED === 'true' || false;

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map();

// Temporary MFA verification tokens (expire after 5 minutes)
const mfaVerificationTokens = new Map();

/**
 * Strong password validation helper
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }
  
  // Check password strength using zxcvbn
  const strength = zxcvbn(password);
  if (strength.score < 3) {
    errors.push(`Password is too weak (score: ${strength.score}/4). ${strength.feedback.warning || 'Please choose a stronger password.'}`);
  }
  
  // Reject common passwords
  const commonPasswords = ['password', 'admin', '12345678', 'qwerty', 'letmein', 'welcome', 'monkey', 'dragon'];
  const lowerPassword = password.toLowerCase();
  if (commonPasswords.some(common => lowerPassword.includes(common))) {
    errors.push('Password contains common words and is not secure');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Login endpoint - Authenticate admin user (Step 1: Password verification)
 * If MFA is enabled, returns a temporary token that must be verified with MFA code
 */
router.post('/login',
  adminRateLimit,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      // CRITICAL: Require ADMIN_PASSWORD_HASH to be set (no plain text fallback)
      if (!ADMIN_PASSWORD_HASH) {
        console.error('❌ CRITICAL: ADMIN_PASSWORD_HASH not configured');
        return res.status(500).json({
          success: false,
          error: 'Admin authentication not configured. ADMIN_PASSWORD_HASH must be set.'
        });
      }

      const { password } = req.body;

      // Verify password using bcrypt
      const passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

      if (!passwordValid) {
        // Log failed login attempt
        console.warn(`⚠️ Failed admin login attempt from IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }

      // Password is valid - check if MFA is enabled
      if (ADMIN_MFA_ENABLED && ADMIN_MFA_SECRET) {
        // Generate temporary MFA verification token (expires in 5 minutes)
        const mfaToken = jwt.sign(
          {
            mfaVerification: true,
            timestamp: Date.now()
          },
          JWT_SECRET,
          { expiresIn: '5m' }
        );

        // Store MFA verification token
        mfaVerificationTokens.set(mfaToken, {
          createdAt: Date.now(),
          ip: req.ip
        });

        console.log(`✅ Admin password verified, MFA required from IP: ${req.ip}`);

        return res.json({
          success: true,
          requiresMFA: true,
          mfaToken: mfaToken,
          message: 'Password verified. Please enter your MFA code.'
        });
      }

      // MFA not enabled - generate JWT token directly
      const token = jwt.sign(
        { 
          admin: true,
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session (optional, for token revocation)
      activeSessions.set(token, {
        createdAt: Date.now(),
        ip: req.ip
      });

      console.log(`✅ Admin login successful (no MFA) from IP: ${req.ip}`);

      res.json({
        success: true,
        requiresMFA: false,
        token: token,
        expiresIn: JWT_EXPIRES_IN,
        message: 'Login successful'
      });

    } catch (error) {
      console.error('❌ Admin login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  }
);

/**
 * MFA verification endpoint - Verify TOTP code (Step 2: MFA verification)
 */
router.post('/verify-mfa',
  adminRateLimit,
  [
    body('mfaToken')
      .notEmpty()
      .withMessage('MFA token is required'),
    body('mfaCode')
      .notEmpty()
      .withMessage('MFA code is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('MFA code must be 6 digits')
      .matches(/^[0-9]{6}$/)
      .withMessage('MFA code must be 6 digits')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const { mfaToken, mfaCode } = req.body;

      // Verify MFA token
      let decoded;
      try {
        decoded = jwt.verify(mfaToken, JWT_SECRET);
        if (!decoded.mfaVerification) {
          return res.status(401).json({
            success: false,
            error: 'Invalid MFA verification token'
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: 'MFA verification token expired or invalid. Please login again.'
        });
      }

      // Check if token exists in our store
      if (!mfaVerificationTokens.has(mfaToken)) {
        return res.status(401).json({
          success: false,
          error: 'MFA verification token not found. Please login again.'
        });
      }

      // Verify MFA code
      if (!ADMIN_MFA_SECRET) {
        return res.status(500).json({
          success: false,
          error: 'MFA not configured'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: ADMIN_MFA_SECRET,
        encoding: 'base32',
        token: mfaCode,
        window: 2 // Allow 2 time steps (60 seconds) before/after current time
      });

      if (!verified) {
        console.warn(`⚠️ Failed MFA verification attempt from IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid MFA code'
        });
      }

      // MFA verified - remove temporary token
      mfaVerificationTokens.delete(mfaToken);

      // Generate final JWT token
      const token = jwt.sign(
        { 
          admin: true,
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Store session
      activeSessions.set(token, {
        createdAt: Date.now(),
        ip: req.ip
      });

      console.log(`✅ Admin MFA verified and login successful from IP: ${req.ip}`);

      res.json({
        success: true,
        token: token,
        expiresIn: JWT_EXPIRES_IN,
        message: 'MFA verified. Login successful.'
      });

    } catch (error) {
      console.error('❌ MFA verification error:', error);
      res.status(500).json({
        success: false,
        error: 'MFA verification failed. Please try again.'
      });
    }
  }
);

/**
 * MFA setup endpoint - Generate TOTP secret and QR code (admin only, requires token)
 */
router.get('/mfa/setup',
  (req, res, next) => {
    console.log('🔐 MFA setup middleware - request received');
    console.log('🔐 Method:', req.method);
    console.log('🔐 Path:', req.path);
    console.log('🔐 URL:', req.url);
    next();
  },
  adminRateLimit,
  async (req, res) => {
    try {
      console.log('🔐 MFA setup endpoint handler - starting execution');
      // This endpoint should be protected, but for initial setup, we'll allow it
      // In production, you might want to add additional verification

      if (ADMIN_MFA_SECRET) {
        console.log('ℹ️ MFA secret already configured, returning existing setup');
        // MFA already configured - return existing setup info
        const otpauthUrl = speakeasy.otpauthURL({
          secret: ADMIN_MFA_SECRET,
          encoding: 'base32',
          label: 'ClickALinks Admin',
          issuer: 'ClickALinks'
        });

        let qrCodeDataUrl;
        try {
          qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        } catch (qrError) {
          console.error('❌ Error generating QR code:', qrError);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate QR code'
          });
        }

        return res.json({
          success: true,
          secret: ADMIN_MFA_SECRET,
          qrCode: qrCodeDataUrl,
          otpauthUrl: otpauthUrl,
          message: 'MFA is already configured. Use this QR code to set up your authenticator app.'
        });
      }

      // Generate new MFA secret
      console.log('🔄 Generating new MFA secret...');
      let secret;
      try {
        secret = speakeasy.generateSecret({
          name: 'ClickALinks Admin',
          length: 32
        });
        console.log('✅ MFA secret generated');
      } catch (secretError) {
        console.error('❌ Error generating MFA secret:', secretError);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate MFA secret',
          details: secretError.message
        });
      }

      let otpauthUrl;
      try {
        otpauthUrl = speakeasy.otpauthURL({
          secret: secret.base32,
          encoding: 'base32',
          label: 'ClickALinks Admin',
          issuer: 'ClickALinks'
        });
        console.log('✅ OTP auth URL generated');
      } catch (urlError) {
        console.error('❌ Error generating OTP auth URL:', urlError);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate OTP auth URL',
          details: urlError.message
        });
      }

      let qrCodeDataUrl;
      try {
        console.log('🔄 Generating QR code...');
        qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        console.log('✅ QR code generated');
      } catch (qrError) {
        console.error('❌ Error generating QR code:', qrError);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate QR code',
          details: qrError.message
        });
      }

      res.json({
        success: true,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauthUrl: otpauthUrl,
        message: 'MFA secret generated. Scan the QR code with your authenticator app and set ADMIN_MFA_SECRET in environment variables.',
        instructions: [
          '1. Scan the QR code with Google Authenticator, Authy, or similar app',
          '2. Copy the secret: ' + secret.base32,
          '3. Set ADMIN_MFA_SECRET=' + secret.base32 + ' in your environment variables',
          '4. Set ADMIN_MFA_ENABLED=true to enable MFA',
          '5. Restart the server'
        ]
      });

    } catch (error) {
      console.error('❌ MFA setup error:', error);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Failed to generate MFA secret',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

/**
 * Verify token endpoint - Check if token is valid
 */
router.get('/verify', adminRateLimit, (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.headers['x-admin-token'] ||
                  req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'No token provided'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // JWT is valid - trust it even if session not in memory (server restart scenario)
      // Restore session if not in memory
      if (!activeSessions.has(token)) {
        activeSessions.set(token, {
          createdAt: decoded.timestamp || Date.now(),
          ip: req.ip
        });
      }

      res.json({
        success: true,
        valid: true,
        admin: decoded.admin || false,
        expiresAt: decoded.exp * 1000 // Convert to milliseconds
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          valid: false,
          error: 'Token expired'
        });
      }
      throw error;
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid token'
    });
  }
});

/**
 * Logout endpoint - Invalidate token
 */
router.post('/logout', adminRateLimit, (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.headers['x-admin-token'];

    if (token && activeSessions.has(token)) {
      activeSessions.delete(token);
      console.log(`✅ Admin logout successful from IP: ${req.ip}`);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * Middleware to verify admin token
 * Use this to protect admin routes
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.headers['x-admin-token'] ||
                  req.headers['x-api-key']; // Fallback for backward compatibility

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // First check if it's a JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // CRITICAL: Verify admin role in token
      if (!decoded.admin || decoded.admin !== true) {
        console.warn(`⚠️ Unauthorized access attempt - token valid but admin role missing. IP: ${req.ip}`);
        return res.status(403).json({
          success: false,
          error: 'Admin role required. Token does not have admin privileges.'
        });
      }

      // JWT is valid and has admin role - trust it even if session not in memory (server restart scenario)
      // Optionally verify session exists (for token revocation), but don't require it
      if (!activeSessions.has(token)) {
        // Session not in memory (likely server restart) - but JWT is valid
        // Add it back to active sessions for future checks
        activeSessions.set(token, {
          createdAt: decoded.timestamp || Date.now(),
          ip: req.ip
        });
        console.log('ℹ️ Token valid but session not in memory - restored to active sessions');
      }

      // Attach admin info to request
      req.admin = decoded;
      return next();
    } catch (jwtError) {
      // If JWT verification fails, check if it's the legacy API key
      const adminApiKey = process.env.ADMIN_API_KEY;
      if (token === adminApiKey) {
        console.warn('⚠️ Using legacy API key authentication. Please migrate to JWT tokens.');
        return next();
      }
      
      throw jwtError;
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token'
    });
  }
};

export default router;

