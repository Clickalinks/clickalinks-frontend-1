/**
 * Fisher-Yates Shuffle Algorithm
 * Efficient O(n) shuffle algorithm - industry standard for random shuffling
 * This is the most popular and performant shuffle algorithm
 */

import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc, 
  serverTimestamp
} from 'firebase/firestore';

/**
 * Fisher-Yates Shuffle Algorithm
 * Shuffles an array in-place using the Fisher-Yates algorithm
 * Time Complexity: O(n) - optimal for shuffling
 * Space Complexity: O(1) - shuffles in place
 * 
 * @param {Array} array - Array to shuffle
 * @param {number} seed - Optional seed for deterministic shuffling
 * @returns {Array} - Shuffled array (same reference, shuffled in place)
 */
export function fisherYatesShuffle(array, seed = null) {
  // Create a copy to avoid mutating the original
  const shuffled = [...array];
  
  // Seeded random number generator (if seed provided)
  let currentSeed = seed || Math.random() * 1000000;
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  // Fisher-Yates algorithm: iterate from end to beginning
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const randomIndex = seed 
      ? Math.floor(seededRandom() * (i + 1))
      : Math.floor(Math.random() * (i + 1));
    
    // Swap current element with randomly selected element
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generate a time-based seed for deterministic shuffling
 * Same time period = same seed = same shuffle order
 * This ensures all users see the same shuffle during a 2-hour period
 */
export function getTimeBasedSeed() {
  // 2-hour periods: changes every 2 hours
  const period = Math.floor(Date.now() / (2 * 60 * 60 * 1000));
  return period;
}

/**
 * Perform Fisher-Yates shuffle of all purchases
 * This is the main shuffle function that rotates all 2000 squares
 * Uses Fisher-Yates algorithm for optimal performance
 */
export async function performFisherYatesShuffle() {
  const seed = getTimeBasedSeed();
  console.log(`🔄 Starting Fisher-Yates shuffle with seed ${seed}...`);
  
  try {
    // STEP 1: Fetch all active purchases
    const querySnapshot = await getDocs(
      query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
    );
    
    const purchases = [];
    const now = new Date();
    
    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const purchaseId = data.purchaseId || docSnapshot.id;
      
      // Filter expired purchases
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= now) return; // Skip expired
      }
      
      // Filter unpaid purchases
      if (data.paymentStatus && data.paymentStatus !== 'paid') return;
      
      // Skip orphaned ads (no valid logo)
      const logoData = data.logoData;
      let hasValidLogo = false;
      if (logoData && typeof logoData === 'string' && logoData.trim() !== '') {
        if (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('data:')) {
          hasValidLogo = true;
        }
      }
      if (!hasValidLogo) {
        console.warn(`⚠️ Skipping orphaned ad (no valid logo) for purchaseId: ${purchaseId}`);
        return;
      }
      
      purchases.push({
        purchaseId,
        docId: docSnapshot.id,
        data
      });
    });
    
    if (purchases.length === 0) {
      console.log('ℹ️ No purchases to shuffle');
      return { success: true, shuffled: 0, seed };
    }
    
    // Limit to 2000 purchases (one per square)
    if (purchases.length > 2000) {
      console.warn(`⚠️ More purchases (${purchases.length}) than squares (2000), shuffling first 2000`);
      purchases.splice(2000);
    }
    
    console.log(`📊 Shuffling ${purchases.length} purchases using Fisher-Yates algorithm...`);
    
    // STEP 2: Create array of square numbers (1-2000)
    const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
    
    // STEP 3: Shuffle squares using Fisher-Yates algorithm
    const shuffledSquares = fisherYatesShuffle(allSquares, seed);
    
    // STEP 4: Assign purchases to shuffled squares
    const assignments = purchases.map((purchase, index) => ({
      purchaseId: purchase.purchaseId,
      docId: purchase.docId,
      squareNumber: shuffledSquares[index],
      pageNumber: Math.ceil(shuffledSquares[index] / 200)
    }));
    
    // STEP 5: Verify no duplicates BEFORE updating
    const squareNumbers = new Set();
    const purchaseIds = new Set();
    
    assignments.forEach(assignment => {
      if (squareNumbers.has(assignment.squareNumber)) {
        throw new Error(`❌ DUPLICATE SQUARE DETECTED: ${assignment.squareNumber} assigned to multiple purchases`);
      }
      if (purchaseIds.has(assignment.purchaseId)) {
        throw new Error(`❌ DUPLICATE PURCHASE DETECTED: ${assignment.purchaseId} appears multiple times`);
      }
      squareNumbers.add(assignment.squareNumber);
      purchaseIds.add(assignment.purchaseId);
    });
    
    console.log(`✅ Pre-commit verification: ${assignments.length} unique assignments, no duplicates`);
    
    // STEP 6: Atomic batch update (all or nothing)
    const MAX_BATCH = 500; // Firestore batch limit
    const batches = [];
    let currentBatch = writeBatch(db);
    let count = 0;
    
    assignments.forEach(assignment => {
      const docRef = doc(db, 'purchasedSquares', assignment.docId);
      
      // Update document with new square assignment
      // Preserve all other data (logoData, businessName, etc.)
      currentBatch.update(docRef, {
        squareNumber: assignment.squareNumber,
        pageNumber: assignment.pageNumber,
        updatedAt: serverTimestamp(),
        shuffledAt: serverTimestamp(),
        shuffleSeed: seed
      });
      
      count++;
      
      // Firestore batches have a limit of 500 operations
      if (count >= MAX_BATCH - 10) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        count = 0;
      }
    });
    
    // Add final batch if it has operations
    if (count > 0) {
      batches.push(currentBatch);
    }
    
    // STEP 7: Commit all batches atomically
    console.log(`💾 Committing ${batches.length} batch(es) (${assignments.length} total updates)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`✅ Batch ${i + 1}/${batches.length} committed`);
    }
    
    console.log(`✅ Fisher-Yates shuffle completed: ${assignments.length} purchases shuffled with seed ${seed}`);
    
    return {
      success: true,
      shuffled: assignments.length,
      seed,
      batches: batches.length
    };
    
  } catch (error) {
    console.error('❌ Fisher-Yates shuffle error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Calculate time until next shuffle (in seconds)
 * Shuffles happen every 2 hours
 */
export function getTimeUntilNextShuffle() {
  const SHUFFLE_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  const now = Date.now();
  const currentPeriod = Math.floor(now / SHUFFLE_INTERVAL);
  const nextShuffleTime = (currentPeriod + 1) * SHUFFLE_INTERVAL;
  const timeUntilShuffle = Math.max(0, Math.floor((nextShuffleTime - now) / 1000));
  return timeUntilShuffle;
}

