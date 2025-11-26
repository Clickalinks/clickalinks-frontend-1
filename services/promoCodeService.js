/**
 * Promo Code Service
 * Manages promotion codes/coupons with Firestore storage
 * Supports usage limits, expiry dates, and different discount types
 */

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firestore if not already initialized
const db = admin.firestore();
const COLLECTION_NAME = 'promoCodes';

/**
 * Validate a promo code
 * @param {string} code - The promo code to validate
 * @param {number} originalAmount - Original purchase amount
 * @returns {Object} - Validation result with discount details
 */
export async function validatePromoCode(code, originalAmount = 0) {
  try {
    if (!code || typeof code !== 'string') {
      return {
        valid: false,
        error: 'Invalid promo code format'
      };
    }

    const codeUpper = code.trim().toUpperCase();
    
    // Fetch promo code from Firestore
    const promoDoc = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (promoDoc.empty) {
      return {
        valid: false,
        error: 'Promo code not found or inactive'
      };
    }

    const promoData = promoDoc.docs[0].data();
    const promoId = promoDoc.docs[0].id;
    const now = new Date();

    // Check expiry date
    if (promoData.expiryDate) {
      const expiryDate = promoData.expiryDate.toDate();
      if (expiryDate < now) {
        return {
          valid: false,
          error: 'Promo code has expired'
        };
      }
    }

    // Check start date (if set)
    if (promoData.startDate) {
      const startDate = promoData.startDate.toDate();
      if (startDate > now) {
        return {
          valid: false,
          error: 'Promo code is not yet active'
        };
      }
    }

    // Check usage limits
    const usedCount = promoData.usedCount || 0;
    const maxUses = promoData.maxUses || Infinity;

    if (usedCount >= maxUses) {
      return {
        valid: false,
        error: 'Promo code has reached maximum usage limit'
      };
    }

    // Calculate discount
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let freeDays = 0;

    if (promoData.discountType === 'percent') {
      // Percentage discount
      discountAmount = (originalAmount * promoData.discountValue) / 100;
      finalAmount = Math.max(0, originalAmount - discountAmount);
    } else if (promoData.discountType === 'fixed') {
      // Fixed amount discount
      discountAmount = Math.min(promoData.discountValue, originalAmount);
      finalAmount = Math.max(0, originalAmount - discountAmount);
    } else if (promoData.discountType === 'free_days') {
      // Free days (e.g., 10 free days)
      freeDays = promoData.discountValue || 0;
      // For free days, we'll handle this in the frontend by extending duration
      discountAmount = 0; // Will be calculated based on days
      finalAmount = originalAmount; // Price stays same, but duration extends
    } else if (promoData.discountType === 'free') {
      // 100% off (free purchase)
      discountAmount = originalAmount;
      finalAmount = 0;
    }

    return {
      valid: true,
      promoId: promoId,
      code: codeUpper,
      discountType: promoData.discountType,
      discountValue: promoData.discountValue,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
      freeDays: freeDays,
      description: promoData.description || '',
      maxUses: maxUses,
      usedCount: usedCount,
      remainingUses: maxUses - usedCount
    };

  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    return {
      valid: false,
      error: 'Error validating promo code'
    };
  }
}

/**
 * Apply/Use a promo code (increment usage count)
 * @param {string} code - The promo code that was used
 * @param {string} purchaseId - The purchase ID that used this code
 * @returns {Object} - Result of applying the code
 */
export async function applyPromoCode(code, purchaseId) {
  try {
    const codeUpper = code.trim().toUpperCase();
    
    // Find the promo code
    const promoDoc = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .limit(1)
      .get();

    if (promoDoc.empty) {
      return {
        success: false,
        error: 'Promo code not found'
      };
    }

    const promoRef = promoDoc.docs[0].ref;
    const promoData = promoDoc.docs[0].data();

    // Increment usage count
    const newUsedCount = (promoData.usedCount || 0) + 1;
    
    // Update Firestore
    await promoRef.update({
      usedCount: newUsedCount,
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsedBy: purchaseId
    });

    // If max uses reached, deactivate
    if (promoData.maxUses && newUsedCount >= promoData.maxUses) {
      await promoRef.update({
        active: false
      });
    }

    return {
      success: true,
      usedCount: newUsedCount,
      remainingUses: (promoData.maxUses || Infinity) - newUsedCount
    };

  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a new promo code
 * @param {Object} promoData - Promo code data
 * @returns {Object} - Created promo code
 */
export async function createPromoCode(promoData) {
  try {
    const {
      code,
      discountType, // 'percent', 'fixed', 'free', 'free_days'
      discountValue,
      description,
      maxUses,
      expiryDate,
      startDate,
      active = true
    } = promoData;

    if (!code || !discountType || discountValue === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, discountType, discountValue'
      };
    }

    const codeUpper = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        error: 'Promo code already exists'
      };
    }

    // Create promo code document
    const newPromo = {
      code: codeUpper,
      discountType,
      discountValue,
      description: description || '',
      maxUses: maxUses || null,
      usedCount: 0,
      active: active,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
      startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null
    };

    const docRef = await db.collection(COLLECTION_NAME).add(newPromo);

    return {
      success: true,
      promoId: docRef.id,
      code: codeUpper,
      ...newPromo
    };

  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk create promo codes (for campaigns like 200 free days)
 * @param {Object} config - Configuration for bulk creation
 * @returns {Object} - Result with created codes
 */
export async function bulkCreatePromoCodes(config) {
  try {
    const {
      count = 200,
      prefix = 'FREE10',
      discountType = 'free_days',
      discountValue = 10, // 10 free days
      description = '10 Free Days Campaign',
      maxUses = 1, // Each code can only be used once
      expiryDate = null,
      startDate = null
    } = config;

    const createdCodes = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      // Generate unique code: PREFIX + random 6 characters
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const code = `${prefix}${randomSuffix}`;

      const result = await createPromoCode({
        code,
        discountType,
        discountValue,
        description,
        maxUses,
        expiryDate,
        startDate,
        active: true
      });

      if (result.success) {
        createdCodes.push({
          code: result.code,
          promoId: result.promoId
        });
      } else {
        errors.push({
          code,
          error: result.error
        });
      }
    }

    return {
      success: true,
      created: createdCodes.length,
      failed: errors.length,
      codes: createdCodes,
      errors: errors
    };

  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all promo codes (for admin dashboard)
 * @param {Object} filters - Optional filters
 * @returns {Object} - List of promo codes
 */
export async function getAllPromoCodes(filters = {}) {
  try {
    let query = db.collection(COLLECTION_NAME);

    if (filters.active !== undefined) {
      query = query.where('active', '==', filters.active);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const promoCodes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      promoCodes.push({
        id: doc.id,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        description: data.description,
        maxUses: data.maxUses,
        usedCount: data.usedCount || 0,
        remainingUses: data.maxUses ? data.maxUses - (data.usedCount || 0) : 'Unlimited',
        active: data.active,
        expiryDate: data.expiryDate ? data.expiryDate.toDate().toISOString() : null,
        startDate: data.startDate ? data.startDate.toDate().toISOString() : null,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
      });
    });

    return {
      success: true,
      promoCodes,
      count: promoCodes.length
    };

  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

