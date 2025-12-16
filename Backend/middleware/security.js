/**
 * Security Middleware
 * Centralized security configurations for the backend
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import timeout from 'express-timeout-handler';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://www.virustotal.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Firebase/Stripe embeds
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting configurations
// Note: trust proxy must be set in server.js before using these limiters
// Using default keyGenerator - express-rate-limit handles IPv6 automatically
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Default keyGenerator handles IPv6 correctly when trust proxy is enabled
});

// Stricter rate limit for promo code validation (prevent brute force)
export const promoCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 promo code attempts per 15 minutes
  message: 'Too many promo code attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Default keyGenerator handles IPv6 correctly when trust proxy is enabled
});

// Stricter rate limit for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 payment attempts per 15 minutes
  message: 'Too many payment attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Default keyGenerator handles IPv6 correctly when trust proxy is enabled
});

// Very strict rate limit for admin endpoints
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit to 50 admin requests per 15 minutes
  message: 'Too many admin requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Default keyGenerator handles IPv6 correctly when trust proxy is enabled
});

// Request timeout configuration
export const requestTimeout = timeout.handler({
  timeout: 30000, // 30 seconds
  onTimeout: (req, res) => {
    res.status(503).json({
      success: false,
      error: 'Request timeout. Please try again.',
    });
  },
  disable: ['write', 'setHeaders', 'send', 'json', 'end'], // Don't disable these
});

// Sanitize error messages to prevent information leakage
export const sanitizeError = (error, isDevelopment = false) => {
  // In production, hide sensitive error details
  if (!isDevelopment) {
    // Generic error messages for production
    if (error.message.includes('Firebase')) {
      return 'Database error. Please try again.';
    }
    if (error.message.includes('Stripe')) {
      return 'Payment processing error. Please try again.';
    }
    if (error.message.includes('API key') || error.message.includes('authentication')) {
      return 'Authentication error. Please check your credentials.';
    }
    return 'An error occurred. Please try again.';
  }
  
  // In development, show full error
  return error.message;
};

// Log sanitization - remove sensitive data from logs
export const sanitizeLogData = (data) => {
  const sensitiveKeys = ['password', 'apiKey', 'secret', 'token', 'key', 'email', 'card'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 0) {
        sanitized[key] = sanitized[key].substring(0, 4) + '***';
      }
    }
  }
  
  return sanitized;
};

