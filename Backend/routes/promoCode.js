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
import { promoCodeRateLimit } from '../middleware/security.js';
import { body, validationResult } from 'express-validator';
import { verifyAdminToken } from './admin.js';

const router = express.Router();

// Validate promo code (public endpoint)
// SECURITY: Apply rate limiting and input validation
router.post('/validate', 
  promoCodeRateLimit,
  [
    body('code')
      .trim()
      .isLength({ min: 1, max: 50 })
      .matches(/^[A-Z0-9-_]+$/)
      .withMessage('Promo code must be 1-50 characters and contain only letters, numbers, hyphens, and underscores'),
    body('originalAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Original amount must be a positive number')
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          valid: false,
          error: errors.array()[0].msg
        });
      }
      
      const { code, originalAmount, email, businessName } = req.body;
      
      // Sanitize input
      const sanitizedCode = code.trim().toUpperCase();
      const sanitizedAmount = Math.max(0, parseFloat(originalAmount) || 0);
      const sanitizedEmail = email ? email.trim().toLowerCase() : null;
      const sanitizedBusiness = businessName ? businessName.trim().toLowerCase() : null;
      
      const result = await validatePromoCode(sanitizedCode, sanitizedAmount, sanitizedEmail, sanitizedBusiness);
      
      // Return appropriate HTTP status code based on validation result
      if (!result.valid || !result.success) {
        return res.status(400).json(result);
      }
      
      res.json(result);
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      res.status(500).json({
        success: false,
        valid: false,
        error: 'Error validating promo code'
      });
    }
  }
);

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
router.post('/create', verifyAdminToken, async (req, res) => {
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
router.post('/bulk-create', verifyAdminToken, async (req, res) => {
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
router.get('/list', verifyAdminToken, async (req, res) => {
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
router.delete('/:id', verifyAdminToken, async (req, res) => {
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
router.post('/bulk-delete', verifyAdminToken, async (req, res) => {
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

