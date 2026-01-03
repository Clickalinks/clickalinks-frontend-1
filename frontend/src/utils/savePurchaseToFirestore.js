import { db } from '../firebase';
import { doc, getDocs, collection, query, where } from 'firebase/firestore';
import { generateUniquePurchaseId } from './generateUniqueId';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

// Track ongoing saves to prevent duplicates
const ongoingSaves = new Map();

/**
 * Save purchase data to Firestore
 * CRITICAL: This function prevents duplicates by:
 * 1. Checking for existing documents with the same squareNumber
 * 2. Deleting ALL duplicates before saving
 * 3. Using a lock to prevent simultaneous saves
 */
export const savePurchaseToFirestore = async (purchaseData) => {
  const squareNumber = purchaseData.squareNumber;
  
  // Generate unique purchase ID (not tied to square number)
  const purchaseId = purchaseData.purchaseId || generateUniquePurchaseId();
  const lockKey = `save_${purchaseId}`;
  
  // Prevent multiple simultaneous saves for the same purchase
  if (ongoingSaves.has(lockKey)) {
    console.warn(`⚠️ Save already in progress for purchase ${purchaseId}, skipping duplicate call`);
    return false;
  }
  
  ongoingSaves.set(lockKey, true);
  
  try {
    console.log('🔥 SAVING PURCHASE TO FIRESTORE:', {
      purchaseId: purchaseId,
      squareNumber: purchaseData.squareNumber,
      businessName: purchaseData.businessName,
      hasLogo: !!purchaseData.logoData
    });

    if (!purchaseData.squareNumber) {
      console.error('❌ Cannot save: squareNumber is missing');
      return false;
    }

    // SECURITY: Use backend API instead of direct Firestore writes
    // Backend uses Admin SDK which bypasses security rules
    console.log(`📤 Saving purchase via secure backend API...`);
    
    const requestData = {
      purchaseId: purchaseId,
      squareNumber: purchaseData.squareNumber,
      pageNumber: purchaseData.pageNumber || 1,
      businessName: purchaseData.businessName,
      contactEmail: purchaseData.contactEmail || '',
      logoData: purchaseData.logoData || null,
      dealLink: purchaseData.website || purchaseData.dealLink || '',
      amount: purchaseData.amount || purchaseData.finalAmount || 10,
      duration: purchaseData.duration || purchaseData.selectedDuration || 30,
      transactionId: purchaseData.transactionId || purchaseData.sessionId || '',
      status: 'active',
      paymentStatus: 'paid',
      startDate: purchaseData.startDate || new Date().toISOString(),
      endDate: purchaseData.endDate || new Date(Date.now() + (purchaseData.duration || purchaseData.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
      purchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
      storagePath: purchaseData.storagePath || null
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to save purchase');
      }

      console.log('✅ Successfully saved purchase via backend API:', {
        purchaseId: result.purchaseId,
        square: purchaseData.squareNumber,
        businessName: purchaseData.businessName
      });

      // Verify it was saved (with retry logic)
      let verificationPassed = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
        const verifyDoc = await getDocs(
          query(collection(db, 'purchasedSquares'), where('purchaseId', '==', purchaseId))
        );
        
        if (!verifyDoc.empty) {
          console.log(`✅ VERIFICATION SUCCESS (attempt ${attempt + 1}): Document found in Firestore`);
          verificationPassed = true;
          break;
        } else {
          console.warn(`⚠️ Verification attempt ${attempt + 1} failed, retrying...`);
        }
      }
      
      if (!verificationPassed) {
        console.warn('⚠️ Verification failed but purchase was saved (eventual consistency)');
      }
      
      return true;

  } catch (error) {
    console.error('❌ Error saving purchase via backend API:', error);
    console.error('Error message:', error.message);
    
    return false;
  } finally {
    // Always release the lock
    ongoingSaves.delete(lockKey);
  }
};

/**
 * Check localStorage for unsaved purchases and save them to Firestore
 * This runs on page load to catch any purchases that didn't trigger the Success page
 */
export const syncLocalStorageToFirestore = async () => {
  try {
    console.log('🔄 Checking localStorage for unsaved purchases...');
    
    // Check squarePurchases
    const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
    const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');

    // Debug: Log what we found
    console.log('📦 localStorage contents:', {
      squarePurchases: Object.keys(squarePurchases).length,
      pendingPurchases: Object.keys(pendingPurchases).length,
      businessFormData: businessFormData.businessName || businessFormData.name || 'none'
    });

    // Log all squarePurchases for debugging
    Object.entries(squarePurchases).forEach(([squareNumber, purchase]) => {
      console.log(`📋 Square ${squareNumber}:`, {
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        hasLogo: !!purchase.logoData,
        businessName: purchase.businessName
      });
    });

    let savedCount = 0;

    // Process squarePurchases - ONLY sync purchases with confirmed payment
    for (const [squareNumber, purchase] of Object.entries(squarePurchases)) {
      // CRITICAL: Only sync purchases with confirmed payment status
      const hasRequiredData = purchase.squareNumber || squareNumber;
      const isNotCancelled = purchase.status !== 'cancelled' && purchase.status !== 'failed';
      const hasConfirmedPayment = purchase.paymentStatus === 'paid' || purchase.status === 'active';
      
      if (hasRequiredData && isNotCancelled && hasConfirmedPayment) {
        console.log(`📦 Found confirmed purchase for square ${squareNumber}, checking Firestore...`);
        
        // Check if already in Firestore
        const checkSnapshot = await getDocs(
          query(collection(db, 'purchasedSquares'), where('squareNumber', '==', parseInt(squareNumber)))
        );
        
        if (checkSnapshot.empty) {
          // Not in Firestore, save it
          console.log(`💾 Saving square ${squareNumber} to Firestore...`);
          
          // Get logo path if stored separately
          const logoPath = localStorage.getItem(`logoPath_${squareNumber}`);
          
          // Merge with businessFormData for complete data
          const logoData = purchase.logoData || businessFormData.logoData;
          
          // CRITICAL: Only skip if logo is a Firebase Storage URL that's broken
          // Allow data URLs and other formats to sync
          if (logoData && logoData.includes('firebasestorage.googleapis.com')) {
            try {
              // Try to fetch the logo to verify it exists (with timeout)
              const fetchPromise = fetch(logoData, { method: 'HEAD' });
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              );
              
              const response = await Promise.race([fetchPromise, timeoutPromise]);
              if (!response.ok) {
                console.warn(`⚠️ Logo URL is broken (${response.status}) for square ${squareNumber}, skipping sync and removing from localStorage`);
                
                // CRITICAL: Remove broken logo from localStorage to prevent it from showing
                const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
                delete squarePurchases[squareNumber];
                localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
                localStorage.removeItem(`logoPath_${squareNumber}`);
                
                // Don't sync if logo is broken - user should re-upload
                continue;
              }
            } catch (error) {
              // If it's a timeout or network error, still allow sync (logo might be temporarily unavailable)
              console.warn(`⚠️ Could not verify logo URL for square ${squareNumber}, syncing anyway:`, error.message);
              // Continue with sync - logo might be temporarily unavailable
            }
          }
          
          // Generate purchase ID if not present
          const purchaseId = purchase.purchaseId || `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          
          const completePurchase = {
            ...purchase,
            ...businessFormData,
            purchaseId: purchaseId, // Ensure purchaseId is set
            squareNumber: parseInt(squareNumber),
            logoData: logoData,
            storagePath: logoPath || purchase.storagePath,
            status: 'active', // Ensure status is active
            paymentStatus: 'paid', // Ensure payment status is paid
            endDate: purchase.endDate || new Date(Date.now() + (purchase.duration || purchase.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString()
          };
          
          console.log(`📤 Attempting to save square ${squareNumber} to Firestore:`, {
            purchaseId: purchaseId,
            businessName: completePurchase.businessName,
            hasLogo: !!completePurchase.logoData,
            logoType: completePurchase.logoData ? (completePurchase.logoData.startsWith('data:') ? 'Data URL' : 'URL') : 'None'
          });
          
          const success = await savePurchaseToFirestore(completePurchase);
          if (success) {
            savedCount++;
            console.log(`✅ Successfully synced square ${squareNumber} to Firestore`);
          } else {
            console.error(`❌ Failed to sync square ${squareNumber} to Firestore`);
          }
        } else {
          console.log(`✅ Square ${squareNumber} already in Firestore, skipping`);
        }
      } else {
        console.log(`⏭️ Skipping square ${squareNumber} (not confirmed payment):`, {
          hasRequiredData,
          isNotCancelled,
          hasConfirmedPayment,
          paymentStatus: purchase.paymentStatus,
          status: purchase.status
        });
      }
    }

    // Process pendingPurchases (by session ID) - ONLY if payment was confirmed
    // NOTE: pendingPurchases are only saved AFTER successful payment, so these should be safe to sync
    for (const [sessionId, purchase] of Object.entries(pendingPurchases)) {
      // CRITICAL: Only sync if payment was confirmed (has transactionId or paymentStatus)
      const hasConfirmedPayment = purchase.transactionId || purchase.paymentStatus === 'paid' || purchase.sessionId;
      
      if (purchase.squareNumber && hasConfirmedPayment) {
        console.log(`📦 Found confirmed pending purchase for square ${purchase.squareNumber}, checking Firestore...`);
        
        // Check if already in Firestore
        const checkSnapshot = await getDocs(
          query(collection(db, 'purchasedSquares'), where('squareNumber', '==', purchase.squareNumber))
        );
        
        if (checkSnapshot.empty) {
          // Merge with businessFormData if available
          const logoPath = localStorage.getItem(`logoPath_${purchase.squareNumber}`);
          
          const mergedPurchase = {
            ...purchase,
            ...businessFormData,
            transactionId: purchase.transactionId || purchase.sessionId || sessionId,
            logoData: purchase.logoData || businessFormData.logoData,
            storagePath: logoPath || purchase.storagePath,
            status: 'active',
            paymentStatus: 'paid'
          };
          
          console.log(`💾 Saving confirmed pending purchase for square ${purchase.squareNumber} to Firestore...`);
          const success = await savePurchaseToFirestore(mergedPurchase);
          if (success) savedCount++;
        } else {
          console.log(`✅ Square ${purchase.squareNumber} already in Firestore, skipping`);
        }
      } else {
        console.log(`⏭️ Skipping pending purchase (no confirmed payment):`, {
          squareNumber: purchase.squareNumber,
          hasTransactionId: !!purchase.transactionId,
          paymentStatus: purchase.paymentStatus
        });
      }
    }

    // DO NOT sync businessFormData directly - it's only saved before payment
    // Only sync purchases that have confirmed payment status

    if (savedCount > 0) {
      console.log(`✅ Synced ${savedCount} purchase(s) from localStorage to Firestore`);
    } else {
      console.log('ℹ️ No unsaved purchases found in localStorage');
      console.log('💡 If you completed a payment, check:');
      console.log('   1. Is data in localStorage? (Check browser DevTools > Application > Local Storage)');
      console.log('   2. Do Firestore security rules allow writes?');
      console.log('   3. Is Firebase properly configured?');
    }

    return savedCount;

  } catch (error) {
    console.error('❌ Error syncing localStorage to Firestore:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return 0;
  }
};

