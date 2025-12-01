/**
 * Shuffle Admin Routes
 * Secure endpoints for shuffle operations
 */

import express from 'express';
import { performGlobalShuffle, getShuffleStats } from '../services/shuffleService.js';

const router = express.Router();

/**
 * Middleware to verify admin authorization
 * Uses ADMIN_API_KEY from environment variables
 */
function verifyAdminAuth(req, res, next) {
  // Check for API key in header (x-api-key) or Authorization header
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['X-API-Key'] ||
                 (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  
  // Use ADMIN_API_KEY or fallback to ADMIN_SECRET_KEY for backward compatibility
  const adminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET_KEY;
  
  if (!adminKey) {
    console.error('❌ ADMIN_API_KEY or ADMIN_SECRET_KEY not configured in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }
  
  if (!apiKey || apiKey !== adminKey) {
    console.warn('⚠️ Unauthorized shuffle attempt:', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid admin API key'
    });
  }
  
  next();
}

/**
 * POST /admin/shuffle
 * Manually trigger a global shuffle
 * Requires admin authentication
 */
router.post('/admin/shuffle', verifyAdminAuth, async (req, res) => {
  try {
    console.log('🔐 Admin shuffle request received');
    
    const result = await performGlobalShuffle();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        shuffledCount: result.shuffledCount,
        seed: result.seed,
        duration: result.duration,
        timestamp: result.timestamp
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
    }
  } catch (error) {
    console.error('❌ Error in shuffle endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /admin/shuffle/stats
 * Get shuffle statistics
 * Requires admin authentication
 */
router.get('/admin/shuffle/stats', verifyAdminAuth, async (req, res) => {
  try {
    const stats = await getShuffleStats();
    
    // Ensure consistent response format
    if (stats.success === false) {
      return res.status(500).json({
        success: false,
        error: stats.error || 'Failed to load shuffle stats',
        totalPurchases: 0,
        shuffledPurchases: 0,
        lastShuffle: null,
        shuffleInterval: '2 hours'
      });
    }
    
    res.json({
      success: true,
      totalPurchases: stats.totalPurchases || 0,
      shuffledPurchases: stats.shuffledPurchases || 0,
      lastShuffle: stats.lastShuffle || null,
      nextShuffleSeed: stats.nextShuffleSeed || null,
      shuffleInterval: stats.shuffleInterval || '2 hours'
    });
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load shuffle stats',
      totalPurchases: 0,
      shuffledPurchases: 0,
      lastShuffle: null,
      shuffleInterval: '2 hours'
    });
  }
});

/**
 * GET /admin/shuffle/health
 * Health check for shuffle service
 * No authentication required (public health check)
 */
router.get('/admin/shuffle/health', async (req, res) => {
  try {
    const stats = await getShuffleStats();
    res.json({
      success: true,
      service: 'shuffle',
      status: 'operational',
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'shuffle',
      status: 'error',
      error: error.message
    });
  }
});

export default router;

