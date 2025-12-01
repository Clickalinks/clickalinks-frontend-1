/**
 * Fisher-Yates Shuffle Service
 * Backend service for shuffling advertising squares
 * Uses Fisher-Yates algorithm for efficient O(n) shuffling
 */

import admin from '../config/firebaseAdmin.js';

// Use admin.firestore() directly for better compatibility
// This ensures Firebase Admin is properly initialized before accessing Firestore
const db = admin.firestore();

const COLLECTION_NAME = 'purchasedSquares'; // Consistent camelCase

/**
 * Fisher-Yates Shuffle Algorithm
 * Shuffles an array in-place using the Fisher-Yates algorithm
 * Time Complexity: O(n)
 * Space Complexity: O(1)
 * 
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Optional seed for deterministic shuffling
 * @returns {Array} - Shuffled array
 */
function fisherYatesShuffle(array, seed = null) {
  const shuffled = [...array];
  const length = shuffled.length;
  
  // Use seed for deterministic shuffling (same seed = same shuffle order)
  let random = seed !== null 
    ? () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      }
    : () => Math.random();
  
  for (let i = length - 1; i > 0; i--) {
    const randomIndex = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Get time-based seed for deterministic shuffling
 * Same time period = same seed = same shuffle order for all users
 * 
 * @returns {number} - Seed based on current 2-hour period
 */
function getTimeBasedSeed() {
  const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  const currentPeriod = Math.floor(now / SHUFFLE_INTERVAL);
  return currentPeriod;
}

/**
 * Perform global shuffle of all active purchases
 * Assigns new squareNumber to each purchase using Fisher-Yates algorithm
 * 
 * @returns {Promise<Object>} - Shuffle result with statistics
 */
export async function performGlobalShuffle() {
  const startTime = Date.now();
  
  try {
    // Verify Firestore is initialized
    if (!db) {
      throw new Error('Firestore database not initialized. Check Firebase Admin configuration.');
    }
    
    console.log('🔄 Starting Fisher-Yates shuffle...');
    
    // Get seed for deterministic shuffling
    const seed = getTimeBasedSeed();
    console.log(`📊 Using seed: ${seed} (2-hour period)`);
    
    // STEP 1: Get all active, paid purchases
    let purchasesSnapshot;
    try {
      purchasesSnapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .where('paymentStatus', '==', 'paid')
        .get();
    } catch (firestoreError) {
      console.error('❌ Firestore query error:', firestoreError);
      throw new Error(`Firestore error: ${firestoreError.message}. Check Firebase configuration and Project ID.`);
    }
    
    if (purchasesSnapshot.empty) {
      console.log('ℹ️ No purchases to shuffle');
      return {
        success: true,
        shuffledCount: 0,
        message: 'No active purchases to shuffle',
        duration: Date.now() - startTime
      };
    }
    
    const purchases = [];
    purchasesSnapshot.forEach(doc => {
      purchases.push({
        docId: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Found ${purchases.length} active purchases to shuffle`);
    
    // STEP 2: Generate array of all available squares (1-2000)
    const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
    
    // STEP 3: Shuffle squares using Fisher-Yates algorithm
    const shuffledSquares = fisherYatesShuffle(allSquares, seed);
    
    // STEP 4: Assign purchases to shuffled squares
    const batch = db.batch();
    const assignments = [];
    
    purchases.forEach((purchase, index) => {
      if (index < shuffledSquares.length) {
        const newSquareNumber = shuffledSquares[index];
        const newPageNumber = Math.ceil(newSquareNumber / 200);
        
        assignments.push({
          docId: purchase.docId,
          purchaseId: purchase.purchaseId || purchase.docId,
          oldSquareNumber: purchase.squareNumber,
          newSquareNumber: newSquareNumber,
          oldPageNumber: purchase.pageNumber,
          newPageNumber: newPageNumber
        });
        
        // Update document
        const docRef = db.collection(COLLECTION_NAME).doc(purchase.docId);
        batch.update(docRef, {
          squareNumber: newSquareNumber,
          pageNumber: newPageNumber,
          shuffledAt: admin.firestore.FieldValue.serverTimestamp(),
          shuffleSeed: seed
        });
      }
    });
    
    // STEP 5: Commit batch update
    await batch.commit();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Shuffle completed: ${assignments.length} purchases shuffled in ${duration}ms`);
    
    return {
      success: true,
      shuffledCount: assignments.length,
      message: `Successfully shuffled ${assignments.length} purchases`,
      seed: seed,
      duration: duration,
      timestamp: new Date().toISOString(),
      assignments: assignments.slice(0, 10) // Return first 10 for logging
    };
    
  } catch (error) {
    console.error('❌ Error performing shuffle:', error);
    return {
      success: false,
      error: error.message,
      errorCode: 'SHUFFLE_ERROR',
      duration: Date.now() - startTime
    };
  }
}

/**
 * Get shuffle statistics
 * 
 * @returns {Promise<Object>} - Shuffle statistics
 */
export async function getShuffleStats() {
  try {
    // Verify Firestore is initialized
    if (!db) {
      return {
        success: false,
        error: 'Firestore database not initialized. Check Firebase Admin configuration.',
        totalPurchases: 0,
        shuffledPurchases: 0,
        lastShuffle: null,
        shuffleInterval: '2 hours'
      };
    }
    
    let purchasesSnapshot;
    try {
      purchasesSnapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .where('paymentStatus', '==', 'paid')
        .get();
    } catch (firestoreError) {
      console.error('❌ Firestore query error:', firestoreError);
      return {
        success: false,
        error: `Firestore error: ${firestoreError.message}. Check Firebase configuration and Project ID.`,
        totalPurchases: 0,
        shuffledPurchases: 0,
        lastShuffle: null,
        shuffleInterval: '2 hours'
      };
    }
    
    const totalPurchases = purchasesSnapshot.size;
    const shuffledPurchases = purchasesSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.shuffledAt !== undefined;
    }).length;
    
    const lastShuffle = purchasesSnapshot.docs
      .map(doc => doc.data().shuffledAt)
      .filter(date => date !== undefined)
      .sort((a, b) => b.toMillis() - a.toMillis())[0];
    
    return {
      success: true,
      totalPurchases: totalPurchases,
      shuffledPurchases: shuffledPurchases,
      lastShuffle: lastShuffle ? lastShuffle.toDate().toISOString() : null,
      nextShuffleSeed: getTimeBasedSeed() + 1,
      shuffleInterval: '2 hours'
    };
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

