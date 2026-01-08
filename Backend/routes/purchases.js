import express from 'express';
import { body, validationResult } from 'express-validator';
import admin from '../config/firebaseAdmin.js';
import { generalRateLimit, adCreationRateLimit } from '../middleware/security.js';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';
import { verifyAdminToken } from './admin.js';
import { validateHttpsOnly, sanitizeUrl } from '../utils/urlValidation.js';
import { validatePromoCode, applyPromoCode } from '../services/promoCodeService.js';
// Note: ClickaLinks does not have user accounts, so ownership verification is not needed.
// Users who need to modify their purchase data (e.g., fix a typo in URL or email) should contact support via email.
// Admin-only endpoints for deleting/updating purchases are protected with verifyAdminToken middleware.

const router = express.Router();
const db = admin.firestore();

/**
 * POST /api/purchases
 * Save a purchase to Firestore via backend API
 * Replaces direct client-side Firestore writes for security
 * 
 * SECURITY: This endpoint allows anyone to create purchases (they're paying for them).
 * Ownership is established at creation time via the contactEmail field.
 * Note: ClickaLinks does not have user accounts or a login system.
 * Users who need to modify their purchase data (e.g., fix a typo in URL or email) should contact support via email at ads@clickalinks.com.
 */
router.post('/purchases',
  adCreationRateLimit, // Stricter rate limit for ad creation (5 per 15 minutes)
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
    const requestTimestamp = new Date().toISOString();
    console.log('\n' + '='.repeat(80));
    console.log('📥 PURCHASE REQUEST RECEIVED:', requestTimestamp);
    console.log('='.repeat(80));
    console.log('🔍 Request Origin:', req.headers.origin || req.headers.referer || 'unknown');
    console.log('🔍 Request Method:', req.method);
    console.log('🔍 Request Path:', req.path);
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ VALIDATION FAILED:', errors.array());
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      let {
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

      // 📊 LOG ALL INCOMING DATA
      console.log('📊 INCOMING REQUEST DATA:');
      console.log('   squareNumber:', squareNumber);
      console.log('   pageNumber:', pageNumber);
      console.log('   businessName:', businessName || 'MISSING');
      console.log('   contactEmail:', contactEmail || 'MISSING');
      console.log('   transactionId:', transactionId || 'MISSING');
      console.log('   purchaseId:', purchaseId || 'WILL BE GENERATED');
      console.log('   amount:', amount);
      console.log('   duration:', duration);
      console.log('   status:', status);
      console.log('   paymentStatus:', paymentStatus);
      console.log('   promoCode:', promoCode || 'none');
      console.log('   logoData:', logoData ? (logoData.substring(0, 80) + '...') : 'MISSING');
      console.log('   storagePath:', storagePath || 'MISSING');
      console.log('   website:', website || 'none');
      console.log('   dealLink:', dealLink || 'none');

      // Generate unique purchase ID if not provided
      const finalPurchaseId = purchaseId || `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const normalizedEmail = contactEmail.trim().toLowerCase();
      const normalizedBusiness = businessName.trim().toLowerCase();

      // ✅ SECURITY: Validate and sanitize URLs (HTTPS only, block dangerous protocols)
      // Validate website URL
      if (website && website.trim()) {
        const websiteValidation = validateHttpsOnly(website.trim());
        if (!websiteValidation.valid) {
          console.log(`❌ Invalid website URL: ${websiteValidation.error}`);
          return res.status(400).json({
            success: false,
            error: websiteValidation.error || 'Invalid website URL. Only HTTPS URLs are allowed.',
            code: 'INVALID_URL',
            suggestion: websiteValidation.sanitized || null
          });
        }
        // Use sanitized version (adds https:// if missing)
        website = websiteValidation.sanitized || website.trim();
      }

      // Validate dealLink URL
      if (dealLink && dealLink.trim()) {
        const dealLinkValidation = validateHttpsOnly(dealLink.trim());
        if (!dealLinkValidation.valid) {
          console.log(`❌ Invalid dealLink URL: ${dealLinkValidation.error}`);
          return res.status(400).json({
            success: false,
            error: dealLinkValidation.error || 'Invalid deal link URL. Only HTTPS URLs are allowed.',
            code: 'INVALID_URL',
            suggestion: dealLinkValidation.sanitized || null
          });
        }
        // Use sanitized version (adds https:// if missing)
        dealLink = dealLinkValidation.sanitized || dealLink.trim();
      }

      // ✅ CHECK 1: Verify promo code hasn't been used by this email/business BEFORE any other checks
      // This must happen first to prevent saving purchases with duplicate promo codes
      // REFRESHED: Stricter validation - check both email AND business name separately
      // NOTE: Using separate queries to avoid requiring composite indexes
      if (promoCode || promoId) {
        // Check by email address - Query paid purchases first, then filter for promo codes
        const paidPurchasesByEmail = await db.collection('purchasedSquares')
          .where('contactEmail', '==', normalizedEmail)
          .where('paymentStatus', '==', 'paid')
          .get();
        
        // Filter for purchases with promo codes
        const existingByEmail = paidPurchasesByEmail.docs.find(doc => {
          const data = doc.data();
          return data.promoCode != null && data.promoCode !== '';
        });
        
        if (existingByEmail) {
          const existing = existingByEmail.data();
          console.log(`❌ Promo code restriction: Email ${normalizedEmail} has already used promo code ${existing.promoCode}`);
          return res.status(400).json({
            success: false,
            error: `This email address has already used a promo code (${existing.promoCode}). Only one promo code per email address is allowed.`,
            code: 'PROMO_ALREADY_USED_EMAIL'
          });
        }

        // Check by business name - Query paid purchases first, then filter for promo codes
        const paidPurchasesByBusiness = await db.collection('purchasedSquares')
          .where('businessName', '==', businessName.trim())
          .where('paymentStatus', '==', 'paid')
          .get();
        
        // Filter for purchases with promo codes
        const existingByBusiness = paidPurchasesByBusiness.docs.find(doc => {
          const data = doc.data();
          return data.promoCode != null && data.promoCode !== '';
        });
        
        if (existingByBusiness) {
          const existing = existingByBusiness.data();
          console.log(`❌ Promo code restriction: Business ${businessName.trim()} has already used promo code ${existing.promoCode}`);
          return res.status(400).json({
            success: false,
            error: `This business name has already used a promo code (${existing.promoCode}). Only one promo code per business is allowed.`,
            code: 'PROMO_ALREADY_USED_BUSINESS'
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
      // Also extract storagePath from logoData URL if storagePath is missing
      let finalLogoData = logoData;
      let finalStoragePath = storagePath;
      
      // If we have logoData URL but no storagePath, extract storagePath from URL
      if (finalLogoData && !finalStoragePath && finalLogoData.includes('firebasestorage.googleapis.com')) {
        try {
          // Extract path from Firebase Storage URL
          // Format: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/logos%2Ffilename?alt=media&token=...
          const urlMatch = finalLogoData.match(/\/o\/([^?]+)/);
          if (urlMatch) {
            finalStoragePath = decodeURIComponent(urlMatch[1]);
            console.log(`✅ Extracted storagePath from logoData URL: ${finalStoragePath}`);
          }
        } catch (extractError) {
          console.warn(`⚠️ Could not extract storagePath from logoData URL: ${extractError.message}`);
        }
      }
      
      if (!finalLogoData && finalStoragePath) {
        // If we have storagePath but no logoData, construct the Firebase Storage URL
        if (finalStoragePath.startsWith('logos/')) {
          // Construct full Firebase Storage URL from path (without token for cleaner URL)
          finalLogoData = `https://firebasestorage.googleapis.com/v0/b/clickalinks-frontend.firebasestorage.app/o/${encodeURIComponent(finalStoragePath)}?alt=media`;
        } else {
          finalLogoData = finalStoragePath; // Use as-is if already a full URL
        }
      }
      
      // Clean logoData URL - remove token parameter for cleaner URL
      if (finalLogoData && finalLogoData.includes('&token=')) {
        finalLogoData = finalLogoData.split('&token=')[0];
        console.log(`✅ Cleaned logoData URL (removed token parameter)`);
      }

      // ✅ CRITICAL: Verify logo file exists in Storage if storagePath is provided
      // This prevents creating purchases with broken logo references
      // IMPORTANT: Only validate if storagePath is explicitly provided
      // If storagePath is missing, allow purchase to proceed (logo can be added later by admin)
      if (finalStoragePath && finalStoragePath.trim() && finalStoragePath.startsWith('logos/')) {
        try {
          const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 'clickalinks-frontend.firebasestorage.app';
          const file = admin.storage().bucket(storageBucket).file(finalStoragePath);
          const [exists] = await file.exists();
          
          if (!exists) {
            console.error(`❌ Logo file not found in Storage: ${finalStoragePath}`);
            console.error(`   Purchase: ${businessName} (${contactEmail})`);
            console.error(`   Square: ${squareNumber}`);
            
            // For paid purchases, don't block the purchase if logo is missing
            // Allow it to be saved and admin can add logo later
            console.warn(`⚠️ Logo file missing but allowing purchase to proceed (paid purchase)`);
            console.warn(`⚠️ Admin should manually add logo for: ${businessName}`);
            // Clear invalid storagePath to prevent broken references
            finalStoragePath = null;
            finalLogoData = null;
          } else {
            console.log(`✅ Verified logo file exists in Storage: ${finalStoragePath}`);
          }
        } catch (storageError) {
          console.error(`❌ Error checking Storage file: ${storageError.message}`);
          // Don't block purchase if Storage check fails (network issue, etc.)
          // But log it for investigation
          console.warn(`⚠️ Continuing with purchase despite Storage check error`);
        }
      } else if (!finalStoragePath && !finalLogoData) {
        // No storagePath and no logoData - this is okay for paid purchases
        // Logo can be added later by admin
        console.warn(`⚠️ No logo data provided - purchase will be saved without logo`);
        console.warn(`⚠️ Admin should manually add logo for: ${businessName}`);
      }


      const purchaseData = {
        purchaseId: finalPurchaseId,
        squareNumber,
        pageNumber,
        businessName: businessName.trim(),
        contactEmail: normalizedEmail,
        logoData: finalLogoData || null,
        logoURL: finalLogoData || null, // Also store as logoURL for compatibility
        storagePath: finalStoragePath || null, // Save storage path for reference
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
      console.log('\n💾 ATTEMPTING TO SAVE TO FIRESTORE:');
      console.log('   Collection: purchasedSquares');
      console.log('   Document ID:', finalPurchaseId);
      console.log('   Purchase Data Summary:', {
        squareNumber: purchaseData.squareNumber,
        pageNumber: purchaseData.pageNumber,
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail,
        hasLogoData: !!purchaseData.logoData,
        hasStoragePath: !!purchaseData.storagePath,
        amount: purchaseData.amount,
        transactionId: purchaseData.transactionId,
        status: purchaseData.status,
        paymentStatus: purchaseData.paymentStatus
      });
      
      const purchaseRef = db.collection('purchasedSquares').doc(finalPurchaseId);
      
      try {
        await purchaseRef.set(purchaseData);
        console.log(`✅ SUCCESS: Purchase saved to Firestore: ${finalPurchaseId} (Square ${squareNumber})`);
        
        // Verify the save by reading it back
        const verifyDoc = await purchaseRef.get();
        if (verifyDoc.exists) {
          console.log('✅ VERIFIED: Document exists in Firestore after save');
        } else {
          console.error('❌ WARNING: Document does not exist in Firestore after save!');
        }
      } catch (firestoreError) {
        console.error('❌ FIRESTORE SAVE ERROR:', firestoreError);
        console.error('   Error Code:', firestoreError.code);
        console.error('   Error Message:', firestoreError.message);
        console.error('   Error Stack:', firestoreError.stack);
        throw firestoreError;
      }

      // ✅ CRITICAL: Check if emails were already sent before sending
      // Get fresh document to check emailsSent flag
      const freshDoc = await purchaseRef.get();
      const freshData = freshDoc.data();
      
      // Only send emails if emailsSent is false (or undefined for new documents)
      if (!freshData || !freshData.emailsSent) {
        console.log('📧 Sending emails for purchase:', finalPurchaseId);
        
        // ============================================
        // REFRESHED: SEND EMAILS SEQUENTIALLY
        // ============================================
        
        let adminEmailSuccess = false;
        let customerEmailSuccess = false;

        // 1. Send admin notification email
        try {
          const adminResult = await sendAdminNotificationEmail('purchase', {
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
            selectedDuration: parseInt(duration),
            purchaseId: finalPurchaseId,
            promoCode: promoCode || null,
            promoId: promoId || null,
            website: website || dealLink || ''
          });
          adminEmailSuccess = adminResult && adminResult.success;
          if (adminEmailSuccess) {
            console.log('✅ Admin notification email sent successfully');
          } else {
            console.error('❌ Admin notification email failed:', adminResult?.message || 'Unknown error');
          }
        } catch (err) {
          console.error('❌ Admin notification email error:', err.message);
        }

        // 2. Send customer emails (welcome + invoice)
        if (contactEmail) {
          try {
            const customerResult = await sendAdConfirmationEmail({
              businessName: businessName.trim(),
              contactEmail: contactEmail.trim(),
              squareNumber,
              pageNumber,
              duration: parseInt(duration),
              selectedDuration: parseInt(duration),
              amount: finalFinalAmount,
              originalAmount: finalOriginalAmount,
              finalAmount: finalFinalAmount,
              discountAmount: finalDiscountAmount,
              transactionId: transactionId || null,
              promoCode: promoCode || null,
              promoId: promoId || null,
              website: website || dealLink || '',
              logoURL: finalLogoData || null
            });
            customerEmailSuccess = customerResult && customerResult.success;
            if (customerEmailSuccess) {
              console.log('✅ Customer confirmation emails (welcome + invoice) sent successfully');
            } else {
              console.error('❌ Customer confirmation emails failed:', customerResult?.message || 'Unknown error');
            }
          } catch (err) {
            console.error('❌ Customer confirmation email error:', err.message);
          }
        } else {
          console.warn('⚠️ No contact email provided, skipping customer emails');
        }

        // 3. If promo code was used, send special admin notification
        // NOTE: Promo code info is already included in the main purchase notification above
        // No need to send a separate email - this was causing duplicate emails
        if (promoCode) {
          console.log(`📋 Promo code ${promoCode} used - info included in purchase notification email`);
        }

        // Only set emailsSent to true if at least admin email was sent successfully
        // This allows retry if emails fail
        if (adminEmailSuccess || customerEmailSuccess) {
          await purchaseRef.update({ 
            emailsSent: true,
            emailStatus: {
              adminSent: adminEmailSuccess,
              customerSent: customerEmailSuccess,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            }
          });
          console.log('✅ Email status saved:', { adminSent: adminEmailSuccess, customerSent: customerEmailSuccess });
        } else {
          console.error('❌ All emails failed - emailsSent flag NOT set, will retry on next attempt');
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

// Note: The following endpoints have been removed because ClickaLinks does not have user accounts.
// Users who need to view or modify their purchase data should contact support via email at ads@clickalinks.com.
//
// Removed endpoints:
// - GET /api/purchases/:purchaseId (was: Get a specific purchase with ownership verification)
// - PUT /api/purchases/:purchaseId (was: Update a purchase with ownership verification)  
// - GET /api/purchases/user/:email (was: Get all purchases for a specific email)
//
// Admin-only endpoints for purchase management are defined below (protected with verifyAdminToken middleware).

/**
 * PUT /api/purchases/:purchaseId
 * Update a purchase (admin only - no user accounts in ClickaLinks)
 * Users who need to modify their purchase (e.g., fix typo in URL or email) should contact support
 * 
 * REMOVED: Ownership verification endpoints are not needed since ClickaLinks doesn't have user accounts.
 * Users should contact support at ads@clickalinks.com for any purchase changes.
 */
// Endpoint removed - not applicable to ClickaLinks (no user accounts)
// If needed for admin use in future, this should be protected by verifyAdminToken middleware
/*
router.put('/purchases/:purchaseId',
  generalRateLimit,
  [
    body('website').optional().isString().trim().isLength({ max: 500 }).withMessage('Website must be a valid URL (max 500 chars)'),
    body('dealLink').optional().isString().trim().isLength({ max: 500 }).withMessage('Deal link must be a valid URL (max 500 chars)'),
    body('logoData').optional().isString().trim().withMessage('Logo data must be a string')
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
      
      const { purchaseId } = req.params;
      const { website, dealLink, logoData } = req.body;
      
      if (!purchaseId) {
        return res.status(400).json({
          success: false,
          error: 'Purchase ID is required'
        });
      }
      
      // Get purchase document reference
      const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
      const purchaseDoc = await purchaseRef.get();
      
      if (!purchaseDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Purchase not found'
        });
      }
      
      const purchaseData = purchaseDoc.data();
      
      // Only allow updating specific fields (website, dealLink, logoData)
      // Critical fields like amount, duration, status, etc. cannot be modified by users
      const updateData = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      if (website !== undefined) {
        // SECURITY: Validate HTTPS only, block dangerous protocols
        const websiteValidation = validateHttpsOnly(website.trim());
        if (!websiteValidation.valid) {
          return res.status(400).json({
            success: false,
            error: websiteValidation.error || 'Invalid website URL. Only HTTPS URLs are allowed.',
            code: 'INVALID_URL',
            suggestion: websiteValidation.sanitized || null
          });
        }
        const sanitizedWebsite = websiteValidation.sanitized || website.trim();
        updateData.website = sanitizedWebsite;
        updateData.dealLink = sanitizedWebsite; // Keep dealLink in sync with website
      }
      
      if (dealLink !== undefined) {
        // SECURITY: Validate HTTPS only, block dangerous protocols
        const dealLinkValidation = validateHttpsOnly(dealLink.trim());
        if (!dealLinkValidation.valid) {
          return res.status(400).json({
            success: false,
            error: dealLinkValidation.error || 'Invalid deal link URL. Only HTTPS URLs are allowed.',
            code: 'INVALID_URL',
            suggestion: dealLinkValidation.sanitized || null
          });
        }
        const sanitizedDealLink = dealLinkValidation.sanitized || dealLink.trim();
        updateData.dealLink = sanitizedDealLink;
        // If website wasn't provided, update website too
        if (website === undefined) {
          updateData.website = sanitizedDealLink;
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
 * Get all purchases for a specific user (admin only - no user accounts in ClickaLinks)
 * 
 * REMOVED: Ownership verification endpoints are not needed since ClickaLinks doesn't have user accounts.
 * Users should contact support at ads@clickalinks.com for any purchase information.
 */
// Endpoint removed - not applicable to ClickaLinks (no user accounts)
/*
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
*/

export default router;
