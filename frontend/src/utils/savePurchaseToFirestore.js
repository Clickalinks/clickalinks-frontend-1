import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';

/**
 * Save purchase data to Firestore
 * This function can be called from anywhere to ensure data is saved
 */
export const savePurchaseToFirestore = async (purchaseData) => {
  try {
    console.log('🔥 SAVING PURCHASE TO FIRESTORE:', {
      squareNumber: purchaseData.squareNumber,
      businessName: purchaseData.businessName,
      hasLogo: !!purchaseData.logoData
    });

    if (!purchaseData.squareNumber) {
      console.error('❌ Cannot save: squareNumber is missing');
      return false;
    }

    const squareDocRef = doc(db, 'purchasedSquares', purchaseData.squareNumber.toString());
    
    const dataToSave = {
      status: 'active',
      businessName: purchaseData.businessName,
      logoData: purchaseData.logoData || null,
      dealLink: purchaseData.website || purchaseData.dealLink || '',
      contactEmail: purchaseData.contactEmail || '',
      startDate: purchaseData.startDate || new Date().toISOString(),
      endDate: purchaseData.endDate || new Date(Date.now() + (purchaseData.duration || 30) * 24 * 60 * 60 * 1000).toISOString(),
      amount: purchaseData.amount || purchaseData.finalAmount || 10,
      duration: purchaseData.duration || purchaseData.selectedDuration || 30,
      transactionId: purchaseData.transactionId || purchaseData.sessionId || '',
      purchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
      paymentStatus: 'paid',
      storageType: purchaseData.logoData && purchaseData.logoData.includes('firebasestorage') ? 'firebase' : 'local',
      storagePath: purchaseData.storagePath || null,
      squareNumber: purchaseData.squareNumber,
      pageNumber: purchaseData.pageNumber || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(squareDocRef, dataToSave, { merge: true });
    
    console.log('✅ Successfully saved to Firestore:', {
      documentId: purchaseData.squareNumber.toString(),
      square: purchaseData.squareNumber,
      businessName: purchaseData.businessName
    });

    // Verify it was saved
    await new Promise(resolve => setTimeout(resolve, 500));
    const verifySnapshot = await getDocs(
      query(collection(db, 'purchasedSquares'), where('squareNumber', '==', purchaseData.squareNumber))
    );
    
    if (verifySnapshot.empty) {
      console.error('❌ VERIFICATION FAILED: Document not found after save!');
      return false;
    } else {
      console.log('✅ VERIFICATION SUCCESS: Document found in Firestore');
      return true;
    }

  } catch (error) {
    console.error('❌ Error saving to Firestore:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('🚨 PERMISSION DENIED: Firestore security rules are blocking writes!');
    }
    
    return false;
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

    // Process squarePurchases - be more lenient, check for any purchase with squareNumber
    for (const [squareNumber, purchase] of Object.entries(squarePurchases)) {
      // Check if it has required data and isn't explicitly cancelled/failed
      const hasRequiredData = purchase.squareNumber || squareNumber;
      const isNotCancelled = purchase.status !== 'cancelled' && purchase.status !== 'failed';
      
      if (hasRequiredData && isNotCancelled) {
        console.log(`📦 Found purchase for square ${squareNumber}, checking Firestore...`);
        
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
          const completePurchase = {
            ...purchase,
            ...businessFormData,
            squareNumber: parseInt(squareNumber),
            logoData: purchase.logoData || businessFormData.logoData,
            storagePath: logoPath || purchase.storagePath,
            status: 'active', // Ensure status is active
            paymentStatus: purchase.paymentStatus || 'paid'
          };
          
          const success = await savePurchaseToFirestore(completePurchase);
          if (success) savedCount++;
        } else {
          console.log(`✅ Square ${squareNumber} already in Firestore, skipping`);
        }
      } else {
        console.log(`⏭️ Skipping square ${squareNumber}:`, {
          hasRequiredData,
          isNotCancelled,
          status: purchase.status
        });
      }
    }

    // Process pendingPurchases (by session ID)
    for (const [sessionId, purchase] of Object.entries(pendingPurchases)) {
      if (purchase.squareNumber) {
        console.log(`📦 Found pending purchase for square ${purchase.squareNumber}, checking Firestore...`);
        
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
            transactionId: sessionId,
            logoData: purchase.logoData || businessFormData.logoData,
            storagePath: logoPath || purchase.storagePath,
            status: 'active',
            paymentStatus: 'paid'
          };
          
          console.log(`💾 Saving pending purchase for square ${purchase.squareNumber} to Firestore...`);
          const success = await savePurchaseToFirestore(mergedPurchase);
          if (success) savedCount++;
        } else {
          console.log(`✅ Square ${purchase.squareNumber} already in Firestore, skipping`);
        }
      }
    }

    // Also check businessFormData directly if it has squareNumber
    if (businessFormData.squareNumber && !businessFormData.status) {
      console.log(`📦 Found businessFormData with square ${businessFormData.squareNumber}, checking Firestore...`);
      
      const checkSnapshot = await getDocs(
        query(collection(db, 'purchasedSquares'), where('squareNumber', '==', businessFormData.squareNumber))
      );
      
      if (checkSnapshot.empty) {
        const logoPath = localStorage.getItem(`logoPath_${businessFormData.squareNumber}`);
        
        const purchaseData = {
          ...businessFormData,
          squareNumber: businessFormData.squareNumber,
          logoData: businessFormData.logoData,
          storagePath: logoPath,
          status: 'active',
          paymentStatus: 'paid',
          businessName: businessFormData.name || businessFormData.businessName,
          contactEmail: businessFormData.email || businessFormData.contactEmail,
          website: businessFormData.website
        };
        
        console.log(`💾 Saving businessFormData for square ${businessFormData.squareNumber} to Firestore...`);
        const success = await savePurchaseToFirestore(purchaseData);
        if (success) savedCount++;
      }
    }

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

