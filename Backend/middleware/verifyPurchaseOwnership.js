/**
 * Middleware to verify user owns a purchase
 * Verifies ownership by email address (since there's no user authentication system)
 * Users can only modify purchases associated with their email
 */

import admin from '../config/firebaseAdmin.js';

const db = admin.firestore();

/**
 * Verify that the user owns the purchase
 * Ownership is determined by matching email address
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export async function verifyPurchaseOwnership(req, res, next) {
  try {
    const { purchaseId } = req.params;
    const { email, contactEmail } = req.body;
    
    // Get email from request body (prioritize contactEmail, fallback to email)
    const userEmail = (contactEmail || email)?.trim()?.toLowerCase();
    
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        error: 'Purchase ID is required'
      });
    }
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required to verify ownership',
        code: 'EMAIL_REQUIRED'
      });
    }
    
    // Fetch purchase from Firestore
    const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
    const purchaseDoc = await purchaseRef.get();
    
    if (!purchaseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
        code: 'PURCHASE_NOT_FOUND'
      });
    }
    
    const purchaseData = purchaseDoc.data();
    const purchaseEmail = purchaseData.contactEmail?.toLowerCase();
    
    // Verify email matches (case-insensitive)
    if (purchaseEmail !== userEmail) {
      console.log(`❌ Ownership verification failed: ${userEmail} does not own purchase ${purchaseId}`);
      console.log(`   Purchase email: ${purchaseEmail}, Provided email: ${userEmail}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to modify this purchase. Only the owner (matching email) can modify it.',
        code: 'OWNERSHIP_VERIFICATION_FAILED'
      });
    }
    
    // Ownership verified - attach purchase data to request for use in route handlers
    req.purchaseDoc = purchaseDoc;
    req.purchaseData = purchaseData;
    
    console.log(`✅ Ownership verified: ${userEmail} owns purchase ${purchaseId}`);
    next();
    
  } catch (error) {
    console.error('❌ Error verifying purchase ownership:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying purchase ownership',
      message: error.message
    });
  }
}

/**
 * Alternative middleware that verifies ownership by email from query parameter
 * Useful for GET requests where email might be in query string
 */
export async function verifyPurchaseOwnershipByQuery(req, res, next) {
  try {
    const { purchaseId } = req.params;
    const { email, contactEmail } = req.query;
    
    // Get email from query parameters
    const userEmail = (contactEmail || email)?.trim()?.toLowerCase();
    
    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        error: 'Purchase ID is required'
      });
    }
    
    if (!userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required to verify ownership',
        code: 'EMAIL_REQUIRED'
      });
    }
    
    // Fetch purchase from Firestore
    const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
    const purchaseDoc = await purchaseRef.get();
    
    if (!purchaseDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found',
        code: 'PURCHASE_NOT_FOUND'
      });
    }
    
    const purchaseData = purchaseDoc.data();
    const purchaseEmail = purchaseData.contactEmail?.toLowerCase();
    
    // Verify email matches (case-insensitive)
    if (purchaseEmail !== userEmail) {
      console.log(`❌ Ownership verification failed: ${userEmail} does not own purchase ${purchaseId}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this purchase. Only the owner (matching email) can access it.',
        code: 'OWNERSHIP_VERIFICATION_FAILED'
      });
    }
    
    // Ownership verified
    req.purchaseDoc = purchaseDoc;
    req.purchaseData = purchaseData;
    
    next();
    
  } catch (error) {
    console.error('❌ Error verifying purchase ownership:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying purchase ownership',
      message: error.message
    });
  }
}

