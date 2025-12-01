/**
 * Promo Code Routes
 * API endpoints for promo code operations
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

/**
 * Middleware to verify admin authorization for admin routes
 */
function verifyAdminAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['X-API-Key'] ||
                 (req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : null);
  
  const adminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET_KEY;
  
  if (!adminKey) {
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }
  
  if (!apiKey || apiKey !== adminKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid admin API key'
    });
  }
  
  next();
}

/**
 * POST /api/promo-code/validate
 * Validate a promo code (public endpoint)
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, originalAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({
        valid: false,
        error: 'Promo code is required'
      });
    }
    
    const result = await validatePromoCode(code);
    
    if (result.valid) {
      // Calculate discount amount
      let discountAmount = 0;
      let finalAmount = originalAmount || 0;
      
      if (result.discountType === 'percentage') {
        discountAmount = (originalAmount * result.discountValue) / 100;
        finalAmount = Math.max(0, originalAmount - discountAmount);
      } else if (result.discountType === 'fixed') {
        discountAmount = result.discountValue;
        finalAmount = Math.max(0, originalAmount - discountAmount);
      } else if (result.discountType === 'free') {
        discountAmount = originalAmount;
        finalAmount = 0;
      }
      // free_days type doesn't change price, only extends duration
      
      res.json({
        valid: true,
        success: true,
        code: result.code,
        promoId: result.promoId,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: discountAmount,
        finalAmount: finalAmount,
        freeDays: result.freeDays,
        description: result.description
      });
    } else {
      res.json({
        valid: false,
        success: false,
        error: result.error || 'Invalid promo code'
      });
    }
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    res.status(500).json({
      valid: false,
      success: false,
      error: 'Error validating promo code. Please try again.'
    });
  }
});

/**
 * POST /api/promo-code/apply
 * Apply a promo code (increment usage count)
 */
router.post('/apply', async (req, res) => {
  try {
    const { code, promoId } = req.body;
    
    if (!code && !promoId) {
      return res.status(400).json({
        success: false,
        error: 'Promo code or promo ID is required'
      });
    }
    
    const result = await applyPromoCode(code, promoId);
    res.json(result);
  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/create
 * Create a single promo code (admin only)
 */
router.post('/create', verifyAdminAuth, async (req, res) => {
  try {
    const result = await createPromoCode(req.body);
    res.json(result);
  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/bulk-create
 * Bulk create promo codes (admin only)
 */
router.post('/bulk-create', verifyAdminAuth, async (req, res) => {
  try {
    const { count, ...options } = req.body;
    
    if (!count || count < 1 || count > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 1000'
      });
    }
    
    const result = await bulkCreatePromoCodes(count, options);
    res.json(result);
  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/promo-code/list
 * Get all promo codes (admin only)
 */
router.get('/list', verifyAdminAuth, async (req, res) => {
  try {
    const result = await getAllPromoCodes();
    
    // Ensure consistent response format
    if (result.success === false) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to load promo codes',
        promoCodes: result.promoCodes || []
      });
    }
    
    res.json({
      success: true,
      count: result.count || (result.promoCodes ? result.promoCodes.length : 0),
      promoCodes: result.promoCodes || []
    });
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to load promo codes',
      promoCodes: []
    });
  }
});

/**
 * DELETE /api/promo-code/:id
 * Delete a single promo code (admin only)
 */
router.delete('/:id', verifyAdminAuth, async (req, res) => {
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
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/bulk-delete
 * Bulk delete promo codes (admin only)
 * Using POST instead of DELETE because some servers don't support DELETE with body
 */
router.post('/bulk-delete', verifyAdminAuth, async (req, res) => {
  try {
    // Debug: Log the entire request
    console.log('🗑️ Bulk delete request received:', {
      method: req.method,
      body: req.body,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : 'no body',
      contentType: req.get('content-type'),
      promoIds: req.body?.promoIds,
      promoIdsType: typeof req.body?.promoIds,
      promoIdsIsArray: Array.isArray(req.body?.promoIds),
      promoIdsLength: req.body?.promoIds?.length
    });
    
    const { promoIds } = req.body || {};
    
    if (!promoIds) {
      console.error('❌ No promoIds in request body');
      return res.status(400).json({
        success: false,
        error: 'Promo code IDs array is required in request body',
        receivedBody: req.body
      });
    }
    
    if (!Array.isArray(promoIds)) {
      console.error('❌ promoIds is not an array:', typeof promoIds, promoIds);
      return res.status(400).json({
        success: false,
        error: 'Promo code IDs must be an array',
        receivedType: typeof promoIds
      });
    }
    
    if (promoIds.length === 0) {
      console.error('❌ promoIds array is empty');
      return res.status(400).json({
        success: false,
        error: 'Promo code IDs array cannot be empty'
      });
    }
    
    console.log('✅ Valid promoIds received:', {
      count: promoIds.length,
      firstFew: promoIds.slice(0, 5)
    });
    
    const result = await bulkDeletePromoCodes(promoIds);
    
    console.log('🗑️ Bulk delete result:', {
      success: result.success,
      deletedCount: result.deletedCount,
      batches: result.batches,
      error: result.error
    });
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

