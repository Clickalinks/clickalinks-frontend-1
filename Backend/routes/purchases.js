import express from 'express';
import { body, validationResult } from 'express-validator';
import admin from '../config/firebaseAdmin.js';
import { generalRateLimit } from '../middleware/security.js';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';

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
        promoId = null
      } = req.body;

      // Generate unique purchase ID if not provided
      const finalPurchaseId = purchaseId || `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const normalizedEmail = contactEmail.trim().toLowerCase();

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
        amount: parseFloat(amount),
        duration: parseInt(duration),
        status,
        paymentStatus,
        transactionId: transactionId || null,
        promoCode: promoCode || null, // Store promo code used
        promoId: promoId || null, // Store promo code document ID
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

      // Send admin notification email (non-blocking)
      sendAdminNotificationEmail('purchase', {
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim(),
        squareNumber,
        pageNumber,
        duration,
        amount: parseFloat(amount),
        transactionId: transactionId || null,
        finalAmount: parseFloat(amount),
        originalAmount: parseFloat(amount),
        discountAmount: 0,
        selectedDuration: duration,
        purchaseId: finalPurchaseId
      }).catch(err => {
        console.error('❌ Admin notification email error (non-critical):', err.message);
      });

      // Send confirmation email to customer (non-blocking)
      if (contactEmail) {
        sendAdConfirmationEmail({
          businessName: businessName.trim(),
          contactEmail: contactEmail.trim(),
          squareNumber,
          pageNumber,
          duration,
          amount: parseFloat(amount),
          transactionId: transactionId || null
        }).catch(err => {
          console.error('❌ Confirmation email error (non-critical):', err.message);
        });
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

export default router;
