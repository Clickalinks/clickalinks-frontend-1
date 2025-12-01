/**
 * Shuffle Routes
 * Admin endpoints for shuffle management
 */

import express from 'express';
import { performGlobalShuffle, getShuffleStats } from '../services/shuffleService.js';

const router = express.Router();

// Middleware to check admin API key
const checkAdminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'] || req.headers['X-API-KEY'];
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey) {
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }
  
  if (apiKey !== adminApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

// Get shuffle statistics
router.get('/admin/shuffle/stats', checkAdminAuth, async (req, res) => {
  try {
    const stats = await getShuffleStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting shuffle stats',
      totalPurchases: 0,
      shuffledPurchases: 0,
      lastShuffle: null,
      shuffleInterval: '2 hours'
    });
  }
});

// Trigger shuffle
router.post('/admin/shuffle', checkAdminAuth, async (req, res) => {
  try {
    console.log('🔄 Shuffle request received');
    const result = await performGlobalShuffle();
    res.json(result);
  } catch (error) {
    console.error('❌ Shuffle error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error performing shuffle'
    });
  }
});

export default router;

