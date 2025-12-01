/**
 * Promo Code Routes
 * Endpoints for promo code management
 */

import express from 'express';
import {
  validatePromoCode,
  applyPromoCode,
  createPromoCode,
  bulkCreatePromoCodes,
  getAllPromoCodes,
  deletePromoCode,
  bulkDeletePromoCodes
} from '../services/promoCodeService.js';

const router = express.Router();

// Middleware to check admin API key for admin endpoints
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

// Validate promo code (public endpoint)
router.post('/validate', async (req, res) => {
  try {
    const { code, originalAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Promo code is required'
      });
    }
    
    const result = await validatePromoCode(code, originalAmount || 0);
    res.json(result);
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Error validating promo code'
    });
  }
});

// Apply promo code (increment usage)
router.post('/apply', async (req, res) => {
  try {
    const { promoId } = req.body;
    
    if (!promoId) {
      return res.status(400).json({
        success: false,
        error: 'Promo ID is required'
      });
    }
    
    const result = await applyPromoCode(promoId);
    res.json(result);
  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Error applying promo code'
    });
  }
});

// Create single promo code (admin only)
router.post('/create', checkAdminAuth, async (req, res) => {
  try {
    const result = await createPromoCode(req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating promo code'
    });
  }
});

// Bulk create promo codes (admin only)
router.post('/bulk-create', checkAdminAuth, async (req, res) => {
  try {
    const result = await bulkCreatePromoCodes(req.body);
    res.json(result);
  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Error bulk creating promo codes'
    });
  }
});

// List all promo codes (admin only)
router.get('/list', checkAdminAuth, async (req, res) => {
  try {
    const result = await getAllPromoCodes();
    res.json(result);
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Error getting promo codes',
      promoCodes: [],
      count: 0
    });
  }
});

// Delete single promo code (admin only)
router.delete('/:id', checkAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePromoCode(id);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error deleting promo code:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting promo code'
    });
  }
});

// Bulk delete promo codes (admin only)
router.post('/bulk-delete', checkAdminAuth, async (req, res) => {
  try {
    const { promoIds } = req.body;
    
    if (!Array.isArray(promoIds) || promoIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'promoIds array is required'
      });
    }
    
    const result = await bulkDeletePromoCodes(promoIds);
    res.json(result);
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    res.status(500).json({
      success: false,
      error: 'Error bulk deleting promo codes'
    });
  }
});

export default router;

