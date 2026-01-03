import express from 'express';
import { body, validationResult } from 'express-validator';
import admin from '../config/firebaseAdmin.js';
import { generalRateLimit } from '../middleware/security.js';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';
import { verifyPurchaseOwnership, verifyPurchaseOwnershipByQuery } from '../middleware/verifyPurchaseOwnership.js';

const router = express.Router();
const db = admin.firestore();

/**
 * POST /api/purchases
 * Save a purchase to Firestore via backend API
 * Replaces direct client-side Firestore writes for security
 */
router.post('/purchases',
  generalRateLimit,
  [
    body('squareNumber').isInt({ min: 1 }).withMessage('Square number must be a positive integer'),
    body('businessName').notEmpty().trim().withMessage('Business name is required'),
    body('contactEmail').isEmail().withMessage('Valid email is required'),
    body('purchaseId').optional().isString().withMessage('Purchase ID must be a string'),
    body('transactionId').optional().isString().withMessage('Transaction ID must be a string'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    body('status').optional().isIn(['active', 'pending', 'cancelled']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const {
        squareNumber,
        businessName,
        contactEmail,
        purchaseId,
        transactionId,
        amount,
        duration,
        status = 'active',
        pageNumber = 1,
        logoData = null,
        storagePath = null,
        dealLink = '',
        website = '',
        startDate,
        endDate,
        purchaseDate,
        paymentStatus = 'paid',
        promoCode = null,
        promoId = null,
        originalAmount = null,
        finalAmount = null,
        discountAmount = null
      } = req.body;

      // Generate unique purchase ID if not provided
      const finalPurchaseId = purchaseId || `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const normalizedEmail = contactEmail.trim().toLowerCase();
      const normalizedBusiness = businessName.trim().toLowerCase();

      // ✅ CHECK 1: Verify promo code hasn't been used by this email/business BEFORE any other checks
      // This must happen first to prevent saving purchases with duplicate promo codes
      if (promoCode || promoId) {
        const paidPurchasesSnapshot = await db.collection('purchasedSquares')
          .where('paymentStatus', '==', 'paid')
          .get();
        
        const hasUsedPromo = paidPurchasesSnapshot.docs.some(doc => {
          const data = doc.data();
          const hasPromo = data.promoCode || data.promoId;
          if (!hasPromo) return false;
          
          // Check if email matches (case-insensitive)
          const emailMatch = data.contactEmail && data.contactEmail.toLowerCase() === normalizedEmail;
          // Check if business name matches (case-insensitive)
          const businessMatch = data.businessName && data.businessName.toLowerCase() === normalizedBusiness;
          
          // Return true if EITHER email OR business name matches (one-per-user restriction)
          return emailMatch || businessMatch;
        });
        
        if (hasUsedPromo) {
          console.log(`❌ Promo code restriction: ${normalizedEmail} or ${normalizedBusiness} has already used a promo code`);
          return res.status(400).json({
            success: false,
            error: 'Each business/email can only use one promo code. You have already used a promo code.',
            code: 'PROMO_ALREADY_USED'
          });
        }
      }

      // ✅ IDEMPOTENCY CHECK 1: If purchaseId already exists, return success without sending emails
      const existingDocRef = db.collection('purchasedSquares').doc(finalPurchaseId);
      const existingDoc = await existingDocRef.get();
      
      if (existingDoc.exists) {
        console.log(`✅ Purchase already exists (idempotency by purchaseId): ${finalPurchaseId} - returning success without sending emails`);
        return res.json({
          success: true,
          purchaseId: finalPurchaseId,
          message: 'Purchase already exists',
          alreadyExists: true
        });
      }

      // ✅ IDEMPOTENCY CHECK 2: If same email + transactionId combination exists, return success without sending emails
      // This prevents duplicate emails even if purchaseId is different
      if (transactionId) {
        const duplicateQuery = db.collection('purchasedSquares')
          .where('contactEmail', '==', normalizedEmail)
          .where('transactionId', '==', transactionId)
          .limit(1);
        
        const duplicateSnapshot = await duplicateQuery.get();
        
        if (!duplicateSnapshot.empty) {
          const duplicateDoc = duplicateSnapshot.docs[0];
          const duplicateData = duplicateDoc.data();
          console.log(`✅ Duplicate purchase detected (same email + transactionId): ${normalizedEmail} + ${transactionId} - returning success without sending emails`);
          return res.json({
            success: true,
            purchaseId: duplicateData.purchaseId || duplicateDoc.id,
            message: 'Purchase already exists (duplicate email + transaction)',
            alreadyExists: true
          });
        }
      }

      // Calculate amounts - use provided values or defaults
      const finalOriginalAmount = originalAmount !== null ? parseFloat(originalAmount) : parseFloat(amount);
      const finalDiscountAmount = discountAmount !== null ? parseFloat(discountAmount) : 0;
      const finalFinalAmount = finalAmount !== null ? parseFloat(finalAmount) : (finalOriginalAmount - finalDiscountAmount);

      // Calculate dates if not provided
      const now = new Date();
      const finalStartDate = startDate ? new Date(startDate) : now;
      const finalEndDate = endDate ? new Date(endDate) : new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
      const finalPurchaseDate = purchaseDate ? new Date(purchaseDate) : now;

      // Check for existing purchases with same squareNumber on same page (conflicts)
      const existingQuery = db.collection('purchasedSquares')
        .where('squareNumber', '==', squareNumber)
        .where('status', '==', 'active')
        .where('pageNumber', '==', pageNumber);

      const existingSnapshot = await existingQuery.get();

      // Delete conflicting documents (same squareNumber, different purchaseId, same page)
      if (!existingSnapshot.empty) {
        const batch = db.batch();
        existingSnapshot.forEach(doc => {
          const data = doc.data();
          // Only delete if different purchaseId (conflict)
          if (data.purchaseId !== finalPurchaseId) {
            batch.delete(doc.ref);
          }
        });
        await batch.commit();
      }

      // Prepare purchase data
      // Ensure logoData is properly formatted - use storagePath if logoData is missing
      let finalLogoData = logoData;
      if (!finalLogoData && storagePath) {
        // If we have storagePath but no logoData, construct the Firebase Storage URL
        if (storagePath.startsWith('logos/')) {
          // Construct full Firebase Storage URL from path
          finalLogoData = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
        } else {
          finalLogoData = storagePath; // Use as-is if already a full URL
        }
      }


      const purchaseData = {
        purchaseId: finalPurchaseId,
        squareNumber,
        pageNumber,
        businessName: businessName.trim(),
        contactEmail: normalizedEmail,
        logoData: finalLogoData || null,
        storagePath: storagePath || null, // Save storage path for reference
        dealLink: dealLink || website || '',
        amount: finalFinalAmount,
        originalAmount: finalOriginalAmount,
        finalAmount: finalFinalAmount,
        discountAmount: finalDiscountAmount,
        duration: parseInt(duration),
        status,
        paymentStatus,
        transactionId: transactionId || null,
        promoCode: promoCode || null, // Store promo code used
        promoId: promoId || null, // Store promo code document ID
        emailsSent: false, // Flag to track if emails were sent
        startDate: admin.firestore.Timestamp.fromDate(finalStartDate),
        endDate: admin.firestore.Timestamp.fromDate(finalEndDate),
        purchaseDate: admin.firestore.Timestamp.fromDate(finalPurchaseDate),
        clickCount: 0,
        lastClickAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Save to Firestore using Admin SDK (bypasses security rules)
      const purchaseRef = db.collection('purchasedSquares').doc(finalPurchaseId);
      await purchaseRef.set(purchaseData);

      console.log(`✅ Purchase saved via API: ${finalPurchaseId} (Square ${squareNumber})`);

      // ✅ CRITICAL: Check if emails were already sent before sending
      // Get fresh document to check emailsSent flag
      const freshDoc = await purchaseRef.get();
      const freshData = freshDoc.data();
      
      // Only send emails if emailsSent is false (or undefined for new documents)
      if (!freshData || !freshData.emailsSent) {
        // Set flag to true BEFORE sending to prevent race conditions
        await purchaseRef.update({ emailsSent: true });
        
        // Send admin notification email (non-blocking)
      sendAdminNotificationEmail('purchase', {
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim(),
        squareNumber,
        pageNumber,
        duration,
        amount: finalFinalAmount,
        transactionId: transactionId || null,
        finalAmount: finalFinalAmount,
        originalAmount: finalOriginalAmount,
        discountAmount: finalDiscountAmount,
        selectedDuration: duration,
        purchaseId: finalPurchaseId,
        promoCode: promoCode || null,
        promoId: promoId || null
      }).catch(err => {
        console.error('❌ Admin notification email error (non-critical):', err.message);
      });

      // Send confirmation email to customer (non-blocking) - this sends both welcome + invoice
      if (contactEmail) {
        sendAdConfirmationEmail({
          businessName: businessName.trim(),
          contactEmail: contactEmail.trim(),
          squareNumber,
          pageNumber,
          duration: parseInt(duration),
          selectedDuration: parseInt(duration), // Email service uses selectedDuration
          amount: finalFinalAmount,
          originalAmount: finalOriginalAmount,
          finalAmount: finalFinalAmount,
          discountAmount: finalDiscountAmount,
          transactionId: transactionId || null,
          promoCode: promoCode || null,
          promoId: promoId || null
        }).catch(err => {
          console.error('❌ Confirmation email error (non-critical):', err.message);
        });
      }
      } else {
        console.log(`⚠️ Emails already sent for purchase ${finalPurchaseId}, skipping email send`);
      }

      res.json({
        success: true,
        purchaseId: finalPurchaseId,
        message: 'Purchase saved successfully'
      });

    } catch (error) {
      console.error('❌ Error saving purchase:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save purchase',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/track-click
 * Track a click on a business logo
 * Replaces direct client-side Firestore writes for security
 */
router.post('/track-click',
  generalRateLimit,
  [
    body('squareNumber').isInt({ min: 1 }).withMessage('Square number must be a positive integer'),
    body('businessName').optional().isString().withMessage('Business name must be a string'),
    body('dealLink').optional().isString().withMessage('Deal link must be a string'),
    body('pageNumber').optional().isInt({ min: 1 }).withMessage('Page number must be a positive integer')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const {
        squareNumber,
        businessName = '',
        dealLink = '',
        pageNumber = 1
      } = req.body;

      // Get user info (non-critical, fail gracefully)
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers.referer || req.headers.referrer || 'direct';

      // Add click to clickAnalytics collection
      const clickData = {
        squareNumber,
        businessName: businessName.substring(0, 200),
        dealLink: dealLink.substring(0, 500),
        pageNumber,
        userAgent: userAgent.substring(0, 200),
        referrer: referrer.substring(0, 500),
        clickedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('clickAnalytics').add(clickData);

      // Update click count in purchasedSquares document
      // Find the purchase by squareNumber
      const purchaseQuery = db.collection('purchasedSquares')
        .where('squareNumber', '==', squareNumber)
        .where('status', '==', 'active')
        .limit(1);

      const purchaseSnapshot = await purchaseQuery.get();

      if (!purchaseSnapshot.empty) {
        const purchaseDoc = purchaseSnapshot.docs[0];
        await purchaseDoc.ref.update({
          clickCount: admin.firestore.FieldValue.increment(1),
          lastClickAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Return success (fire and forget - don't block user)
      res.json({
        success: true,
        message: 'Click tracked successfully'
      });

    } catch (error) {
      // Fail silently - don't break user experience
      console.error('❌ Error tracking click:', error);
      // Still return success to not break user experience
      res.json({
        success: true,
        message: 'Click tracking attempted'
      });
    }
  }
);

/**
 * GET /api/purchases/:purchaseId
 * Get a specific purchase (requires ownership verification)
 * Users can only view their own purchases
 */
router.get('/purchases/:purchaseId',
  generalRateLimit,
  verifyPurchaseOwnershipByQuery,
  async (req, res) => {
    try {
      const purchaseData = req.purchaseData;
      
      // Don't expose sensitive data like internal IDs
      const safePurchaseData = {
        purchaseId: purchaseData.purchaseId,
        squareNumber: purchaseData.squareNumber,
        pageNumber: purchaseData.pageNumber,
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail,
        website: purchaseData.website || purchaseData.dealLink,
        logoData: purchaseData.logoData,
        amount: purchaseData.amount,
        finalAmount: purchaseData.finalAmount,
        originalAmount: purchaseData.originalAmount,
        discountAmount: purchaseData.discountAmount,
        duration: purchaseData.duration,
        status: purchaseData.status,
        paymentStatus: purchaseData.paymentStatus,
        clickCount: purchaseData.clickCount || 0,
        startDate: purchaseData.startDate?.toDate?.()?.toISOString() || purchaseData.startDate,
        endDate: purchaseData.endDate?.toDate?.()?.toISOString() || purchaseData.endDate,
        purchaseDate: purchaseData.purchaseDate?.toDate?.()?.toISOString() || purchaseData.purchaseDate,
        promoCode: purchaseData.promoCode
      };
      
      res.json({
        success: true,
        purchase: safePurchaseData
      });
      
    } catch (error) {
      console.error('❌ Error fetching purchase:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch purchase',
        message: error.message
      });
    }
  }
);

/**
 * PUT /api/purchases/:purchaseId
 * Update a purchase (requires ownership verification)
 * Users can only update their own purchases
 * Allowed fields: website, dealLink, logoData (limited updates only)
 */
router.put('/purchases/:purchaseId',
  generalRateLimit,
  [
    body('contactEmail').isEmail().withMessage('Valid email is required for ownership verification'),
    body('website').optional().isString().trim().isLength({ max: 500 }).withMessage('Website must be a valid URL (max 500 chars)'),
    body('dealLink').optional().isString().trim().isLength({ max: 500 }).withMessage('Deal link must be a valid URL (max 500 chars)'),
    body('logoData').optional().isString().trim().withMessage('Logo data must be a string')
  ],
  verifyPurchaseOwnership,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }
      
      const { website, dealLink, logoData } = req.body;
      const purchaseDoc = req.purchaseDoc;
      const purchaseData = req.purchaseData;
      
      // Only allow updating specific fields (website, dealLink, logoData)
      // Critical fields like amount, duration, status, etc. cannot be modified by users
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (website !== undefined) {
        updateData.website = website.trim();
        updateData.dealLink = website.trim(); // Keep dealLink in sync with website
      }
      
      if (dealLink !== undefined) {
        updateData.dealLink = dealLink.trim();
        // If website wasn't provided, update website too
        if (website === undefined) {
          updateData.website = dealLink.trim();
        }
      }
      
      if (logoData !== undefined) {
        // Validate logoData is a valid URL or data URL
        if (logoData.trim().startsWith('http://') || 
            logoData.trim().startsWith('https://') || 
            logoData.trim().startsWith('data:image/')) {
          updateData.logoData = logoData.trim();
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid logoData format. Must be a URL or data URL.'
          });
        }
      }
      
      // Only update if there are changes
      if (Object.keys(updateData).length <= 1) { // Only updatedAt
        return res.json({
          success: true,
          message: 'No changes to update',
          purchaseId: purchaseData.purchaseId
        });
      }
      
      // Update purchase document
      await purchaseDoc.ref.update(updateData);
      
      console.log(`✅ Purchase updated by owner: ${purchaseData.purchaseId}`);
      
      res.json({
        success: true,
        message: 'Purchase updated successfully',
        purchaseId: purchaseData.purchaseId,
        updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
      });
      
    } catch (error) {
      console.error('❌ Error updating purchase:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update purchase',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/purchases/user/:email
 * Get all purchases for a specific user (identified by email)
 * Users can only view their own purchases
 */
router.get('/purchases/user/:email',
  generalRateLimit,
  async (req, res) => {
    try {
      const { email } = req.params;
      const normalizedEmail = email.trim().toLowerCase();
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      
      // Fetch all purchases for this email
      const purchasesQuery = db.collection('purchasedSquares')
        .where('contactEmail', '==', normalizedEmail)
        .orderBy('purchaseDate', 'desc');
      
      const purchasesSnapshot = await purchasesQuery.get();
      
      const purchases = purchasesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          purchaseId: data.purchaseId || doc.id,
          squareNumber: data.squareNumber,
          pageNumber: data.pageNumber,
          businessName: data.businessName,
          contactEmail: data.contactEmail,
          website: data.website || data.dealLink,
          logoData: data.logoData,
          amount: data.amount,
          finalAmount: data.finalAmount,
          originalAmount: data.originalAmount,
          discountAmount: data.discountAmount,
          duration: data.duration,
          status: data.status,
          paymentStatus: data.paymentStatus,
          clickCount: data.clickCount || 0,
          startDate: data.startDate?.toDate?.()?.toISOString() || data.startDate,
          endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
          purchaseDate: data.purchaseDate?.toDate?.()?.toISOString() || data.purchaseDate,
          promoCode: data.promoCode
        };
      });
      
      res.json({
        success: true,
        purchases,
        count: purchases.length
      });
      
    } catch (error) {
      console.error('❌ Error fetching user purchases:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch purchases',
        message: error.message
      });
    }
  }
);

export default router;
