/**
 * Promo Code Service
 * Clean implementation for promo code management
 */

import admin from '../config/firebaseAdmin.js';

// Get Firestore instance lazily to ensure Firebase Admin is initialized
const getDb = () => {
  try {
    return admin.firestore();
  } catch (error) {
    console.error('❌ Error getting Firestore instance:', error);
    throw new Error('Firebase Admin not initialized. Check Firebase configuration.');
  }
};

const COLLECTION_NAME = 'promoCodes';

/**
 * Validate a promo code
 * 
 * @param {string} code - Promo code to validate
 * @param {number} originalAmount - Original amount before discount
 * @param {string} email - Customer email (optional, for one-per-user restriction)
 * @param {string} businessName - Business name (optional, for one-per-business restriction)
 * @returns {Promise<Object>} - Validation result
 */
export async function validatePromoCode(code, originalAmount, email = null, businessName = null) {
  try {
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        valid: false,
        error: 'Invalid promo code format'
      };
    }
    
    const codeUpper = code.trim().toUpperCase();
    const db = getDb();
    
    // Try exact match first
    let promoSnapshot = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    // If no exact match, try prefix matching (e.g., "PROMO10" matches "PROMO10-XXXXX")
    if (promoSnapshot.empty) {
      const allPromosSnapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
      
      const matchingPromo = allPromosSnapshot.docs.find(doc => {
        const promoCode = doc.data().code || '';
        return promoCode.startsWith(codeUpper) || codeUpper.startsWith(promoCode.split('-')[0]);
      });
      
      if (matchingPromo) {
        promoSnapshot = {
          docs: [matchingPromo],
          empty: false
        };
      }
    }
    
    if (promoSnapshot.empty) {
      return {
        success: false,
        valid: false,
        error: 'Promo code not found'
      };
    }
    
    const promoData = promoSnapshot.docs[0].data();
    const promoId = promoSnapshot.docs[0].id;
    
    // Check expiration
    if (promoData.expiresAt) {
      const expiresAt = promoData.expiresAt.toDate ? promoData.expiresAt.toDate() : new Date(promoData.expiresAt);
      if (expiresAt < new Date()) {
        return {
          success: false,
          valid: false,
          error: 'Promo code has expired'
        };
      }
    }
    
    // Check usage limits
    const currentUses = promoData.currentUses || 0;
    const maxUses = promoData.maxUses || Infinity;
    
    if (currentUses >= maxUses) {
      return {
        success: false,
        valid: false,
        error: 'Promo code has reached its usage limit'
      };
    }

    // ✅ ONE PER USER RESTRICTION: Check if email/business has already used ANY promo code
    if (email || businessName) {
      const db = getDb();
      const normalizedEmail = email ? email.trim().toLowerCase() : null;
      const normalizedBusiness = businessName ? businessName.trim().toLowerCase() : null;
      
      // Fetch all paid purchases (we'll filter client-side for email/business match)
      // Note: Firestore doesn't support OR queries, so we fetch all and filter
      const paidPurchasesSnapshot = await db.collection('purchasedSquares')
        .where('paymentStatus', '==', 'paid')
        .get();
      
      // Check if any existing purchase used a promo code with matching email OR business
      const hasUsedPromo = paidPurchasesSnapshot.docs.some(doc => {
        const data = doc.data();
        // Check if promo code was used (has promoCode field or promoId)
        const hasPromo = data.promoCode || data.promoId;
        if (!hasPromo) return false;
        
        // Check if email matches (if provided)
        const emailMatch = normalizedEmail && data.contactEmail && data.contactEmail.toLowerCase() === normalizedEmail;
        // Check if business name matches (if provided)
        const businessMatch = normalizedBusiness && data.businessName && data.businessName.toLowerCase() === normalizedBusiness;
        
        // Return true if either email OR business matches (one-per-user restriction)
        return emailMatch || businessMatch;
      });
      
      if (hasUsedPromo) {
        return {
          success: false,
          valid: false,
          error: 'Each business/email can only use one promo code. You have already used a promo code.'
        };
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let freeDays = 0;
    
    // Support both 'percentage' and legacy 'percent' for backward compatibility
    if (promoData.discountType === 'percentage' || promoData.discountType === 'percent') {
      discountAmount = (originalAmount * promoData.discountValue) / 100;
      finalAmount = Math.max(0, originalAmount - discountAmount);
    } else if (promoData.discountType === 'fixed') {
      discountAmount = Math.min(promoData.discountValue, originalAmount);
      finalAmount = Math.max(0, originalAmount - discountAmount);
    } else if (promoData.discountType === 'free_days') {
      freeDays = promoData.discountValue || 0;
      discountAmount = 0; // No price discount
      finalAmount = originalAmount; // Price unchanged
    } else if (promoData.discountType === 'free') {
      discountAmount = originalAmount;
      finalAmount = 0;
    }
    
    return {
      success: true,
      valid: true,
      code: promoData.code,
      promoId: promoId,
      discountType: promoData.discountType,
      discountValue: promoData.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalAmount: Math.round(finalAmount * 100) / 100,
      freeDays: freeDays,
      description: promoData.description || 'Promo code applied'
    };
    
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    return {
      success: false,
      valid: false,
      error: 'Error validating promo code'
    };
  }
}

/**
 * Apply a promo code (increment usage)
 * 
 * @param {string} promoId - Promo code document ID
 * @returns {Promise<Object>} - Application result
 */
export async function applyPromoCode(promoId) {
  try {
    const db = getDb();
    const promoRef = db.collection(COLLECTION_NAME).doc(promoId);
    const promoDoc = await promoRef.get();
    
    if (!promoDoc.exists) {
      return {
        success: false,
        error: 'Promo code not found'
      };
    }
    
    const promoData = promoDoc.data();
    const currentUses = promoData.currentUses || 0;
    const maxUses = promoData.maxUses || Infinity;
    
    if (currentUses >= maxUses) {
      return {
        success: false,
        error: 'Promo code has reached its usage limit'
      };
    }
    
    // Increment usage
    await promoRef.update({
      currentUses: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Promo code applied successfully'
    };
    
  } catch (error) {
    console.error('❌ Error applying promo code:', error);
    return {
      success: false,
      error: 'Error applying promo code'
    };
  }
}

/**
 * Create a single promo code
 * 
 * @param {Object} promoData - Promo code data
 * @returns {Promise<Object>} - Creation result
 */
export async function createPromoCode(promoData) {
  try {
    const {
      code,
      discountType,
      discountValue,
      maxUses = 1,
      expiresAt = null,
      description = '',
      status = 'active'
    } = promoData;
    
    // If no expiration provided and maxUses is high (likely a campaign promo), set default to 1 year
    let finalExpiresAt = expiresAt;
    if (!expiresAt && maxUses > 10) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      finalExpiresAt = oneYearFromNow.toISOString();
      console.log(`ℹ️ No expiration provided for ${code}, setting default to 1 year: ${finalExpiresAt}`);
    }
    
    if (!code || !discountType || discountValue === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, discountType, discountValue'
      };
    }
    
    const codeUpper = code.trim().toUpperCase();
    const db = getDb();
    
    // Check if code already exists
    const existingSnapshot = await db.collection(COLLECTION_NAME)
      .where('code', '==', codeUpper)
      .limit(1)
      .get();
    
    if (!existingSnapshot.empty) {
      return {
        success: false,
        error: 'Promo code already exists'
      };
    }
    
    const newPromo = {
      code: codeUpper,
      discountType,
      discountValue,
      maxUses,
      currentUses: 0,
      status,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: finalExpiresAt ? admin.firestore.Timestamp.fromDate(new Date(finalExpiresAt)) : null
    };
    
    const docRef = await db.collection(COLLECTION_NAME).add(newPromo);
    
    return {
      success: true,
      promoId: docRef.id,
      message: 'Promo code created successfully'
    };
    
  } catch (error) {
    console.error('❌ Error creating promo code:', error);
    return {
      success: false,
      error: 'Error creating promo code'
    };
  }
}

/**
 * Bulk create promo codes
 * 
 * @param {Object} options - Bulk create options
 * @returns {Promise<Object>} - Creation result
 */
export async function bulkCreatePromoCodes(options) {
  try {
    const {
      code,
      count = 1,
      discountType,
      discountValue,
      maxUses = 1,
      useSameCodeName = false,
      expiresAt = null,
      description = ''
    } = options;
    
    // If no expiration provided and maxUses is high (likely a campaign promo), set default to 1 year
    let finalExpiresAt = expiresAt;
    if (!expiresAt && maxUses > 10) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      finalExpiresAt = oneYearFromNow.toISOString();
      console.log(`ℹ️ No expiration provided for ${code}, setting default to 1 year: ${finalExpiresAt}`);
    }
    
    if (!code || !discountType || discountValue === undefined) {
      return {
        success: false,
        error: 'Missing required fields: code, discountType, discountValue'
      };
    }
    
    const created = [];
    const errors = [];
    
    const db = getDb();
    
    for (let i = 0; i < count; i++) {
      try {
        let finalCode;
        if (useSameCodeName) {
          // Use same code name for all (e.g., "PROMO10")
          finalCode = code.trim().toUpperCase();
        } else {
          // Generate unique code (e.g., "PROMO10-1234567890-ABC123")
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
          finalCode = `${code.trim().toUpperCase()}-${timestamp}-${random}`;
        }
        
        const newPromo = {
          code: finalCode,
          discountType,
          discountValue,
          maxUses,
          currentUses: 0,
          status: 'active',
          description,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: finalExpiresAt ? admin.firestore.Timestamp.fromDate(new Date(finalExpiresAt)) : null
        };
        
        const docRef = await db.collection(COLLECTION_NAME).add(newPromo);
        created.push({
          id: docRef.id,
          code: finalCode
        });
        
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }
    
    return {
      success: true,
      created: created.length,
      errors: errors.length,
      codes: created,
      errorDetails: errors
    };
    
  } catch (error) {
    console.error('❌ Error bulk creating promo codes:', error);
    return {
      success: false,
      error: 'Error bulk creating promo codes'
    };
  }
}

/**
 * Get all promo codes
 * 
 * @returns {Promise<Object>} - List of promo codes
 */
export async function getAllPromoCodes() {
  try {
    const db = getDb();
    
    // Try to fetch with orderBy, fallback to simple query if index missing
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (error) {
      // If index missing, fetch without orderBy and sort client-side
      console.warn('⚠️ Firestore index missing, fetching without orderBy');
      snapshot = await db.collection(COLLECTION_NAME).get();
    }
    
    const promoCodes = snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now());
      const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : (data.expiresAt ? new Date(data.expiresAt) : null);
      const lastUsedAt = data.lastUsedAt?.toDate ? data.lastUsedAt.toDate() : (data.lastUsedAt ? new Date(data.lastUsedAt) : null);
      
      return {
        id: doc.id,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses || 0,
        currentUses: data.currentUses || 0,
        status: data.status || 'active',
        description: data.description || '',
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        lastUsedAt: lastUsedAt ? lastUsedAt.toISOString() : null
      };
    });
    
    // Sort by createdAt if not already sorted
    promoCodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      promoCodes,
      count: promoCodes.length
    };
    
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    return {
      success: false,
      error: 'Error getting promo codes',
      promoCodes: [],
      count: 0
    };
  }
}

/**
 * Delete a promo code
 * 
 * @param {string} promoId - Promo code document ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deletePromoCode(promoId) {
  try {
    const db = getDb();
    await db.collection(COLLECTION_NAME).doc(promoId).delete();
    
    return {
      success: true,
      message: 'Promo code deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Error deleting promo code:', error);
    return {
      success: false,
      error: 'Error deleting promo code'
    };
  }
}

/**
 * Bulk delete promo codes
 * 
 * @param {Array<string>} promoIds - Array of promo code document IDs
 * @returns {Promise<Object>} - Deletion result
 */
export async function bulkDeletePromoCodes(promoIds) {
  try {
    if (!Array.isArray(promoIds) || promoIds.length === 0) {
      return {
        success: false,
        error: 'Invalid promo IDs array'
      };
    }
    
    const db = getDb();
    const MAX_BATCH = 500; // Firestore batch limit
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    let deleted = 0;
    
    for (const promoId of promoIds) {
      const docRef = db.collection(COLLECTION_NAME).doc(promoId);
      currentBatch.delete(docRef);
      count++;
      deleted++;
      
      if (count >= MAX_BATCH) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        count = 0;
      }
    }
    
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    for (const batch of batches) {
      await batch.commit();
    }
    
    return {
      success: true,
      deleted,
      message: `Successfully deleted ${deleted} promo code(s)`
    };
    
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    return {
      success: false,
      error: 'Error bulk deleting promo codes'
    };
  }
}

