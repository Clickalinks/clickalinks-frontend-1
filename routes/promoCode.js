/**
 * Promo Code Routes
 * API endpoints for promo code validation and management
 */

import express from 'express';
import {
  validatePromoCode,
  applyPromoCode,
  createPromoCode,
  bulkCreatePromoCodes,
  getAllPromoCodes
} from '../services/promoCodeService.js';

const router = express.Router();

/**
 * POST /api/promo-code/validate
 * Validate a promo code
 * Body: { code: string, originalAmount?: number }
 */
router.post('/validate', async (req, res) => {
  try {
    const { code, originalAmount = 0 } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Promo code is required'
      });
    }

    const result = await validatePromoCode(code, originalAmount);

    if (result.valid) {
      res.json({
        success: true,
        valid: true,
        ...result
      });
    } else {
      res.status(400).json({
        success: false,
        valid: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/apply
 * Apply/use a promo code (increment usage)
 * Body: { code: string, purchaseId: string }
 */
router.post('/apply', async (req, res) => {
  try {
    const { code, purchaseId } = req.body;

    if (!code || !purchaseId) {
      return res.status(400).json({
        success: false,
        error: 'Code and purchaseId are required'
      });
    }

    const result = await applyPromoCode(code, purchaseId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

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
 * Create a new promo code (admin only)
 * Requires ADMIN_API_KEY in header
 */
router.post('/create', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

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
      error: error.message
    });
  }
});

/**
 * POST /api/promo-code/bulk-create
 * Bulk create promo codes (for campaigns)
 * Requires ADMIN_API_KEY in header
 * Body: { count: number, prefix: string, discountType: string, discountValue: number, ... }
 */
router.post('/bulk-create', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

    const result = await bulkCreatePromoCodes(req.body);

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
 * Requires ADMIN_API_KEY in header
 */
router.get('/list', async (req, res) => {
  try {
    // Basic admin authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid API Key'
      });
    }

    const filters = {
      active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined
    };

    const result = await getAllPromoCodes(filters);

    res.json(result);

  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

