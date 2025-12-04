/**
 * Admin Authentication Routes
 * Secure backend authentication for admin functions
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { adminRateLimit } from '../middleware/security.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Admin password hash (should be set in environment variables)
// In production, use a strong password and hash it with: bcrypt.hashSync(password, 10)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_API_KEY || 'change-this-secret-in-production';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

// In-memory session store (in production, use Redis or database)
const activeSessions = new Map();

/**
 * Login endpoint - Authenticate admin user
 */
router.post('/login',
  adminRateLimit,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
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

      const { password } = req.body;

      // Verify password
      // If ADMIN_PASSWORD_HASH is set, use bcrypt comparison
      // Otherwise, fall back to direct comparison with ADMIN_PASSWORD (less secure)
      let passwordValid = false;
      
      if (ADMIN_PASSWORD_HASH) {
        // Use bcrypt to compare hashed password
        passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
      } else {
        // Fallback: direct comparison (less secure, but works if hash not set)
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          console.error('❌ ADMIN_PASSWORD or ADMIN_PASSWORD_HASH not configured');
          return res.status(500).json({
            success: false,
            error: 'Admin authentication not configured'
          });
        }
        passwordValid = password === adminPassword;
      }

      if (!passwordValid) {
        // Log failed login attempt
        console.warn(`⚠️ Failed admin login attempt from IP: ${req.ip}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid password'
        });
      }

      // Generate JWT token
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

      console.log(`✅ Admin login successful from IP: ${req.ip}`);

      res.json({
        success: true,
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
      
      // JWT is valid - trust it even if session not in memory (server restart scenario)
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

