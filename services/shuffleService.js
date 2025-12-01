/**
 * Fisher-Yates Shuffle Service
 * Clean implementation for shuffling advertising squares
 * Uses Fisher-Yates algorithm for efficient O(n) shuffling
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

const COLLECTION_NAME = 'purchasedSquares';

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
  
  // Seeded random number generator for deterministic shuffling
  let random;
  if (seed !== null) {
    let currentSeed = seed;
    random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  } else {
    random = () => Math.random();
  }
  
  // Fisher-Yates: iterate from end to beginning
  for (let i = length - 1; i > 0; i--) {
    const randomIndex = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Get time-based seed for deterministic shuffling
 * Same time period = same seed = same shuffle order for all users
 * Shuffles happen every 2 hours
 * 
 * @returns {number} - Seed based on current 2-hour period
 */
function getTimeBasedSeed() {
  const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  const periodStart = Math.floor(now / SHUFFLE_INTERVAL) * SHUFFLE_INTERVAL;
  return periodStart;
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
    console.log('🔄 Starting Fisher-Yates shuffle...');
    
    // Get time-based seed for deterministic shuffling
    const seed = getTimeBasedSeed();
    console.log(`🌱 Using seed: ${seed}`);
    
    // STEP 1: Fetch all active purchases from Firestore
    const db = getDb();
    const purchasesSnapshot = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'active')
      .get();
    
    if (purchasesSnapshot.empty) {
      console.log('ℹ️ No active purchases to shuffle');
      return {
        success: true,
        shuffledCount: 0,
        message: 'No active purchases to shuffle',
        seed: seed,
        duration: Date.now() - startTime
      };
    }
    
    // Convert to array
    const purchases = purchasesSnapshot.docs.map(doc => ({
      docId: doc.id,
      purchaseId: doc.data().purchaseId || doc.id,
      squareNumber: doc.data().squareNumber,
      pageNumber: doc.data().pageNumber,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${purchases.length} active purchases to shuffle`);
    
    // Limit to 2000 purchases (one per square)
    if (purchases.length > 2000) {
      console.warn(`⚠️ More purchases (${purchases.length}) than squares (2000), shuffling first 2000`);
      purchases.splice(2000);
    }
    
    // STEP 2: Generate array of all available squares (1-2000)
    const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
    
    // STEP 3: Shuffle squares using Fisher-Yates algorithm
    const shuffledSquares = fisherYatesShuffle(allSquares, seed);
    
    // STEP 4: Assign purchases to shuffled squares
    const assignments = purchases.map((purchase, index) => ({
      docId: purchase.docId,
      purchaseId: purchase.purchaseId,
      oldSquareNumber: purchase.squareNumber,
      newSquareNumber: shuffledSquares[index],
      oldPageNumber: purchase.pageNumber,
      newPageNumber: Math.ceil(shuffledSquares[index] / 200)
    }));
    
    // STEP 5: Verify no duplicates
    const squareNumbers = new Set();
    const purchaseIds = new Set();
    
    for (const assignment of assignments) {
      if (squareNumbers.has(assignment.newSquareNumber)) {
        throw new Error(`Duplicate square detected: ${assignment.newSquareNumber}`);
      }
      if (purchaseIds.has(assignment.purchaseId)) {
        throw new Error(`Duplicate purchase detected: ${assignment.purchaseId}`);
      }
      squareNumbers.add(assignment.newSquareNumber);
      purchaseIds.add(assignment.purchaseId);
    }
    
    console.log(`✅ Pre-commit verification: ${assignments.length} unique assignments`);
    
    // STEP 6: Batch update (Firestore limit: 500 operations per batch)
    const db = getDb();
    const MAX_BATCH = 500;
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    
    for (const assignment of assignments) {
      const docRef = db.collection(COLLECTION_NAME).doc(assignment.docId);
      currentBatch.update(docRef, {
        squareNumber: assignment.newSquareNumber,
        pageNumber: assignment.newPageNumber,
        shuffledAt: admin.firestore.FieldValue.serverTimestamp(),
        shuffleSeed: seed
      });
      
      count++;
      
      if (count >= MAX_BATCH) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        count = 0;
      }
    }
    
    // Add final batch if it has operations
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // STEP 7: Commit all batches
    console.log(`💾 Committing ${batches.length} batch(es)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Batch ${i + 1}/${batches.length} committed`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Shuffle completed: ${assignments.length} purchases shuffled in ${duration}ms`);
    
    return {
      success: true,
      shuffledCount: assignments.length,
      message: `Successfully shuffled ${assignments.length} purchases`,
      seed: seed,
      duration: duration,
      batches: batches.length
    };
    
  } catch (error) {
    console.error('❌ Shuffle error:', error);
    throw error;
  }
}

/**
 * Get shuffle statistics
 * 
 * @returns {Promise<Object>} - Shuffle statistics
 */
export async function getShuffleStats() {
  try {
    const db = getDb();
    
    // Get total purchases
    const totalSnapshot = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'active')
      .get();
    
    const totalPurchases = totalSnapshot.size;
    
    // Get shuffled purchases (have shuffleSeed)
    const shuffledSnapshot = await db.collection(COLLECTION_NAME)
      .where('status', '==', 'active')
      .where('shuffleSeed', '!=', null)
      .get();
    
    const shuffledPurchases = shuffledSnapshot.size;
    
    // Get last shuffle time
    let lastShuffle = null;
    if (shuffledSnapshot.size > 0) {
      const lastShuffledDoc = shuffledSnapshot.docs
        .map(doc => ({ id: doc.id, shuffledAt: doc.data().shuffledAt }))
        .filter(doc => doc.shuffledAt)
        .sort((a, b) => {
          const aTime = a.shuffledAt?.toMillis?.() || 0;
          const bTime = b.shuffledAt?.toMillis?.() || 0;
          return bTime - aTime;
        })[0];
      
      if (lastShuffledDoc?.shuffledAt) {
        lastShuffle = lastShuffledDoc.shuffledAt.toDate().toISOString();
      }
    }
    
    return {
      success: true,
      totalPurchases: totalPurchases,
      shuffledPurchases: shuffledPurchases,
      lastShuffle: lastShuffle,
      shuffleInterval: '2 hours'
    };
    
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    // Return safe defaults if collection doesn't exist
    return {
      success: true,
      totalPurchases: 0,
      shuffledPurchases: 0,
      lastShuffle: null,
      shuffleInterval: '2 hours'
    };
  }
}

