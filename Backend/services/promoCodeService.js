/**
 * Promo Code Service
 * Backend service for managing promo codes/coupons
 * Handles validation, application, creation, and tracking
 */

import admin from '../config/firebaseAdmin.js';

// Use admin.firestore() instead of getFirestore() for better compatibility
const db = admin.firestore();
const COLLECTION_NAME = 'promoCodes'; // Consistent camelCase

/**
 * Validate a promo code
 * 
 * @param {string} code - Promo code to validate
 * @returns {Promise<Object>} - Validation result
 */
export async function validatePromoCode(code) {
  try {
    if (!code || typeof code !== 'string') {
      return {
        valid: false,
        error: 'Invalid promo code format'
      };
    }
    
    const normalizedCode = code.trim().toUpperCase();
    
    // Find all codes matching the entered code (exact or prefix match)
    let matchingDocs = [];
    
    // First try exact match
    let exactMatchSnapshot = await db.collection(COLLECTION_NAME)
      .where('code', '==', normalizedCode)
      .where('status', '==', 'active')
      .get();
    
    matchingDocs = exactMatchSnapshot.docs;
    
    // If no exact match, try prefix matching (for codes like PROMO10-xxx-yyy)
    if (matchingDocs.length === 0) {
      try {
        // Use range query for prefix matching: code >= prefix AND code < prefix + '\uf8ff'
        const prefixEnd = normalizedCode + '\uf8ff';
        const prefixMatchSnapshot = await db.collection(COLLECTION_NAME)
          .where('code', '>=', normalizedCode)
          .where('code', '<', prefixEnd)
          .where('status', '==', 'active')
          .get();
        
        matchingDocs = prefixMatchSnapshot.docs;
      } catch (indexError) {
        // If composite index is needed, fall back to fetching all active codes and filtering client-side
        if (indexError.message && indexError.message.includes('index')) {
          console.log('⚠️ Composite index needed, falling back to client-side filtering');
          const allActiveSnapshot = await db.collection(COLLECTION_NAME)
            .where('status', '==', 'active')
            .get();
          
          // Filter for codes that start with the prefix
          matchingDocs = allActiveSnapshot.docs.filter(doc => {
            const code = doc.data().code;
            return code && code.toUpperCase().startsWith(normalizedCode);
          });
        } else {
          throw indexError;
        }
      }
    }
    
    if (matchingDocs.length === 0) {
      return {
        valid: false,
        error: 'Promo code not found or inactive'
      };
    }
    
    // Find the first UNUSED code (where usedCount < maxUses)
    let promoDoc = null;
    let promoData = null;
    
    for (const doc of matchingDocs) {
      const data = doc.data();
      
      // Check expiry date
      if (data.expiryDate) {
        const expiryDate = data.expiryDate.toDate();
        if (expiryDate < new Date()) {
          continue; // Skip expired codes
        }
      }
      
      // Check start date
      if (data.startDate) {
        const startDate = data.startDate.toDate();
        if (startDate > new Date()) {
          continue; // Skip codes that aren't active yet
        }
      }
      
      // Check usage limits - find first unused code
      const usedCount = data.usedCount || 0;
      const maxUses = data.maxUses;
      
      if (maxUses === null || usedCount < maxUses) {
        // Found an unused code!
        promoDoc = doc;
        promoData = data;
        break;
      }
    }
    
    // If no unused code found
    if (!promoDoc || !promoData) {
      return {
        valid: false,
        error: 'All promo codes with this name have been used'
      };
    }
    
    return {
      valid: true,
      promoId: promoDoc.id,
      code: promoData.code, // Return the actual code from database (may be full code like PROMO10-xxx)
      discountType: promoData.discountType || 'percentage',
      discountValue: promoData.discountValue || 0,
      freeDays: promoData.freeDays || 0,
      description: promoData.description || `Promo code: ${normalizedCode}`,
      maxUses: promoData.maxUses,
      usedCount: promoData.usedCount || 0
    };
    
  } catch (error) {
    console.error('❌ Error validating promo code:', error);
    return {
      valid: false,
      error: 'Error validating promo code. Please try again.'
    };
  }
}

/**
 * Apply a promo code (increment usage count)
 * 
 * @param {string} code - Promo code to apply
 * @param {string} promoId - Promo code document ID
 * @returns {Promise<Object>} - Application result
 */
export async function applyPromoCode(code, promoId) {
  try {
    const normalizedCode = code.trim().toUpperCase();
    
    if (!promoId) {
      // Try to find by code
      const promoSnapshot = await db.collection(COLLECTION_NAME)
        .where('code', '==', normalizedCode)
        .limit(1)
        .get();
      
      if (promoSnapshot.empty) {
        return {
          success: false,
          error: 'Promo code not found'
        };
      }
      
      promoId = promoSnapshot.docs[0].id;
    }
    
    // Increment usage count
    const promoRef = db.collection(COLLECTION_NAME).doc(promoId);
    await promoRef.update({
      usedCount: admin.firestore.FieldValue.increment(1),
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
      error: error.message
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
      discountType = 'percentage',
      discountValue = 0,
      freeDays = 0,
      description = '',
      maxUses = null,
      startDate = null,
      expiryDate = null
    } = promoData;
    
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'Promo code is required'
      };
    }
    
    const normalizedCode = code.trim().toUpperCase();
    
    // Note: We allow duplicate code names for bulk creation
    // Each code will be a separate document, allowing multiple uses
    // The validation logic will find the first unused code
    
    // Create promo code document
    const promoRef = db.collection(COLLECTION_NAME).doc();
    await promoRef.set({
      code: normalizedCode,
      discountType: discountType,
      discountValue: discountValue,
      freeDays: freeDays,
      description: description || `Promo code: ${normalizedCode}`,
      maxUses: maxUses,
      usedCount: 0,
      status: 'active',
      startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
      expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      success: true,
      promoId: promoRef.id,
      code: normalizedCode,
      message: 'Promo code created successfully'
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
 * Bulk create promo codes
 * 
 * @param {number} count - Number of promo codes to create
 * @param {Object} options - Promo code options
 * @returns {Promise<Object>} - Bulk creation result
 */
export async function bulkCreatePromoCodes(count, options = {}) {
  try {
    const {
      discountType = 'percentage',
      discountValue = 0,
      freeDays = 0,
      description = '',
      maxUses = null,
      startDate = null,
      expiryDate = null,
      prefix = 'PROMO'
    } = options;
    
    if (!count || count < 1 || count > 1000) {
      return {
        success: false,
        error: 'Count must be between 1 and 1000'
      };
    }
    
    const batch = db.batch();
    const createdCodes = [];
    
    // Check if user wants same code name for all (use prefix as the code name)
    const useSameCodeName = options.sameCodeName !== false; // Default to true
    
    for (let i = 0; i < count; i++) {
      let code;
      
      if (useSameCodeName) {
        // Use the prefix as the code name (all codes will have same name)
        code = prefix.toUpperCase();
      } else {
        // Generate unique code with timestamp and random
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        code = `${prefix}-${timestamp}-${random}`;
      }
      
      const promoRef = db.collection(COLLECTION_NAME).doc();
      batch.set(promoRef, {
        code: code,
        discountType: discountType,
        discountValue: discountValue,
        freeDays: freeDays,
        description: description || `Promo code: ${code} (${i + 1}/${count})`,
        maxUses: maxUses || 1, // Default to 1 use per code if not specified
        usedCount: 0,
        status: 'active',
        startDate: startDate ? admin.firestore.Timestamp.fromDate(new Date(startDate)) : null,
        expiryDate: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      createdCodes.push(code);
    }
    
    await batch.commit();
    
    return {
      success: true,
      count: createdCodes.length,
      codes: createdCodes,
      message: `Successfully created ${createdCodes.length} promo codes`
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
 * Delete a promo code by ID
 * 
 * @param {string} promoId - Promo code document ID
 * @returns {Promise<Object>} - Deletion result
 */
export async function deletePromoCode(promoId) {
  try {
    if (!promoId) {
      return {
        success: false,
        error: 'Promo code ID is required'
      };
    }
    
    const promoRef = db.collection(COLLECTION_NAME).doc(promoId);
    const promoDoc = await promoRef.get();
    
    if (!promoDoc.exists) {
      return {
        success: false,
        error: 'Promo code not found'
      };
    }
    
    await promoRef.delete();
    
    return {
      success: true,
      message: 'Promo code deleted successfully'
    };
    
  } catch (error) {
    console.error('❌ Error deleting promo code:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Bulk delete promo codes
 * 
 * @param {Array<string>} promoIds - Array of promo code document IDs
 * @returns {Promise<Object>} - Bulk deletion result
 */
export async function bulkDeletePromoCodes(promoIds) {
  try {
    if (!promoIds || !Array.isArray(promoIds) || promoIds.length === 0) {
      return {
        success: false,
        error: 'Promo code IDs array is required'
      };
    }
    
    const MAX_BATCH_SIZE = 500; // Firestore batch limit
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    let totalDeleted = 0;
    
    console.log(`🗑️ Starting bulk delete of ${promoIds.length} promo codes...`);
    
    for (const promoId of promoIds) {
      const promoRef = db.collection(COLLECTION_NAME).doc(promoId);
      currentBatch.delete(promoRef);
      count++;
      
      // Firestore batches have a limit of 500 operations
      if (count >= MAX_BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        count = 0;
      }
    }
    
    // Add final batch if it has operations
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    console.log(`💾 Committing ${batches.length} batch(es) (${promoIds.length} total deletions)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      // Calculate how many deletions were in this batch
      const batchSize = i === batches.length - 1 
        ? count  // Last batch has the remaining count
        : MAX_BATCH_SIZE; // Full batches
      totalDeleted += batchSize;
      console.log(`✅ Batch ${i + 1}/${batches.length} committed (${batchSize} deletions)`);
    }
    
    console.log(`✅ Bulk delete completed: ${totalDeleted} promo codes deleted`);
    
    return {
      success: true,
      deletedCount: totalDeleted,
      batches: batches.length,
      message: `Successfully deleted ${totalDeleted} promo code(s)`
    };
    
  } catch (error) {
    console.error('❌ Error bulk deleting promo codes:', error);
    return {
      success: false,
      error: error.message
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
    // Try to get all promo codes, handle missing index gracefully
    let promoSnapshot;
    try {
      // First try with orderBy (requires index)
      promoSnapshot = await db.collection(COLLECTION_NAME)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (orderByError) {
      // If orderBy fails (missing index), fall back to simple query
      console.warn('⚠️ orderBy failed, using simple query:', orderByError.message);
      promoSnapshot = await db.collection(COLLECTION_NAME).get();
    }
    
    const promoCodes = [];
    promoSnapshot.forEach(doc => {
      try {
        const data = doc.data();
        promoCodes.push({
          id: doc.id,
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          freeDays: data.freeDays,
          description: data.description,
          maxUses: data.maxUses,
          usedCount: data.usedCount || 0,
          status: data.status,
          startDate: data.startDate ? (data.startDate.toDate ? data.startDate.toDate().toISOString() : data.startDate) : null,
          expiryDate: data.expiryDate ? (data.expiryDate.toDate ? data.expiryDate.toDate().toISOString() : data.expiryDate) : null,
          createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
          lastUsedAt: data.lastUsedAt ? (data.lastUsedAt.toDate ? data.lastUsedAt.toDate().toISOString() : data.lastUsedAt) : null
        });
      } catch (docError) {
        console.warn(`⚠️ Error processing document ${doc.id}:`, docError.message);
        // Continue processing other documents
      }
    });
    
    // Sort client-side if orderBy failed
    if (promoCodes.length > 0 && promoCodes[0].createdAt) {
      promoCodes.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order
      });
    }
    
    return {
      success: true,
      count: promoCodes.length,
      promoCodes: promoCodes
    };
    
  } catch (error) {
    console.error('❌ Error getting promo codes:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message || 'Failed to load promo codes',
      promoCodes: []
    };
  }
}

