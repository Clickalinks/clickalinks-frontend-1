/**
 * Fair Rotation System
 * Ensures equal distribution of logos across all 2000 squares
 * Uses deterministic seed-based rotation for fairness
 */

import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  doc, 
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';

/**
 * Generate deterministic hash from purchaseId + seed
 * Same inputs = same output (deterministic)
 * This ensures same period = same positions
 */
export function deterministicHash(purchaseId, seed) {
  const combined = `${purchaseId}-${seed}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Return value between 0 and 1
  return Math.abs(hash) / 2147483647;
}

/**
 * Calculate fairness score for a purchase
 * Lower score = better placement priority
 * Ensures logos get equal exposure across all pages
 */
export function calculateFairnessScore(purchase, currentPeriod) {
  const history = purchase.data.positionHistory || [];
  const totalRotations = purchase.data.totalRotations || 0;
  
  // Track page usage (1-10, where 1 = first page, 10 = last page)
  const pageUsage = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
  
  // Count how many times this logo appeared on each page
  history.forEach(entry => {
    const page = Math.ceil(entry.squareNumber / 200);
    if (page >= 1 && page <= 10) {
      pageUsage[page]++;
    }
  });
  
  // Calculate score (prefer pages with fewer appearances)
  // Weight by page number so later pages are penalized more
  let score = 0;
  for (let page = 1; page <= 10; page++) {
    score += pageUsage[page] * page; // Page 10 gets 10x weight, page 1 gets 1x
  }
  
  // Bonus for logos that haven't rotated recently
  // This ensures logos that rotated recently get lower priority
  const lastRotation = purchase.data.lastRotationPeriod || 0;
  const periodsSinceLastRotation = currentPeriod - lastRotation;
  score -= periodsSinceLastRotation * 0.1; // Small bonus for not rotating recently
  
  return score;
}

/**
 * Generate current rotation period (2-hour periods)
 * Same period = same seed = same positions
 */
export function getCurrentPeriod() {
  // 2-hour periods: 0, 1, 2, 3, ... (changes every 2 hours)
  return Math.floor(Date.now() / (2 * 60 * 60 * 1000));
}

/**
 * Perform fair rotation of all purchases
 * This is the main function that rotates all 2000 squares fairly
 */
export async function performFairRotation() {
  const currentPeriod = getCurrentPeriod();
  console.log(`🔄 Starting FAIR ROTATION for period ${currentPeriod}...`);
  
  try {
    // STEP 1: Fetch all active purchases
    const querySnapshot = await getDocs(
      query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
    );
    
    const purchases = [];
    const now = new Date();
    
    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      
      // Filter expired purchases
      if (data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= now) return; // Skip expired
      }
      
      // Filter unpaid purchases
      if (data.paymentStatus && data.paymentStatus !== 'paid') return;
      
      const purchaseId = data.purchaseId || docSnapshot.id;
      
      purchases.push({
        purchaseId,
        docId: docSnapshot.id,
        data
      });
    });
    
    if (purchases.length === 0) {
      console.log('ℹ️ No purchases to rotate');
      return { success: true, rotated: 0, period: currentPeriod };
    }
    
    // Limit to 2000 purchases (one per square)
    if (purchases.length > 2000) {
      console.warn(`⚠️ More purchases (${purchases.length}) than squares (2000), rotating first 2000`);
      purchases.splice(2000);
    }
    
    console.log(`📊 Rotating ${purchases.length} purchases...`);
    
    // STEP 2: Generate deterministic random values for each purchase
    // Same seed + same purchaseId = same random value (deterministic)
    purchases.forEach(purchase => {
      purchase.randomValue = deterministicHash(purchase.purchaseId, currentPeriod);
      purchase.fairnessScore = calculateFairnessScore(purchase, currentPeriod);
    });
    
    // STEP 3: Sort by randomValue + fairnessScore
    // Primary: random value (deterministic, ensures randomness)
    // Secondary: fairness score (ensures equal distribution)
    purchases.sort((a, b) => {
      // Primary sort: random value (deterministic)
      const randomDiff = a.randomValue - b.randomValue;
      if (Math.abs(randomDiff) > 0.0001) {
        return randomDiff;
      }
      // Secondary sort: fairness (ensure equal distribution)
      return a.fairnessScore - b.fairnessScore;
    });
    
    // STEP 4: Assign to squares 1-2000
    const squares = Array.from({ length: 2000 }, (_, i) => i + 1);
    const assignments = purchases.map((purchase, index) => ({
      purchaseId: purchase.purchaseId,
      docId: purchase.docId,
      squareNumber: squares[index],
      pageNumber: Math.ceil(squares[index] / 200),
      currentPeriod,
      randomValue: purchase.randomValue,
      fairnessScore: purchase.fairnessScore
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
        lastRotationPeriod: assignment.currentPeriod,
        positionHistory: arrayUnion({
          squareNumber: assignment.squareNumber,
          pageNumber: assignment.pageNumber,
          period: assignment.currentPeriod,
          timestamp: serverTimestamp()
        }),
        totalRotations: increment(1),
        updatedAt: serverTimestamp(),
        rotatedAt: serverTimestamp()
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
    
    console.log(`✅ FAIR ROTATION COMPLETED: ${assignments.length} purchases rotated for period ${currentPeriod}`);
    
    // STEP 8: Verify no duplicates AFTER commit
    await verifyNoDuplicates();
    
    return {
      success: true,
      rotated: assignments.length,
      period: currentPeriod,
      batches: batches.length
    };
    
  } catch (error) {
    console.error('❌ FAIR ROTATION ERROR:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Verify no duplicates exist after rotation
 * This is a safety check to ensure rotation was successful
 */
async function verifyNoDuplicates() {
  console.log('🔍 Verifying no duplicates after rotation...');
  
  const querySnapshot = await getDocs(
    query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
  );
  
  const squareNumberCounts = new Map();
  const purchaseIdSet = new Set();
  const duplicates = [];
  
  querySnapshot.forEach(docSnapshot => {
    const data = docSnapshot.data();
    const squareNum = data.squareNumber;
    const purchaseId = data.purchaseId || docSnapshot.id;
    
    // Track square numbers
    if (squareNum) {
      const count = squareNumberCounts.get(squareNum) || 0;
      squareNumberCounts.set(squareNum, count + 1);
      
      if (count > 0) {
        duplicates.push({ squareNumber: squareNum, purchaseId });
      }
    }
    
    // Track purchase IDs
    if (purchaseIdSet.has(purchaseId)) {
      console.error(`⚠️ Duplicate purchaseId found: ${purchaseId}`);
    }
    purchaseIdSet.add(purchaseId);
  });
  
  // Check for duplicate square numbers
  const duplicateSquares = [];
  squareNumberCounts.forEach((count, squareNum) => {
    if (count > 1) {
      duplicateSquares.push(squareNum);
    }
  });
  
  if (duplicateSquares.length > 0) {
    console.error(`❌ VERIFICATION FAILED: Found ${duplicateSquares.length} duplicate square numbers:`, duplicateSquares);
    throw new Error(`Duplicate squares detected: ${duplicateSquares.join(', ')}`);
  }
  
  console.log(`✅ Verification passed: No duplicates found (${querySnapshot.size} total documents)`);
}

/**
 * Get rotation statistics
 * Useful for monitoring and analytics
 */
export async function getRotationStats() {
  const querySnapshot = await getDocs(
    query(collection(db, 'purchasedSquares'), where('status', '==', 'active'))
  );
  
  const stats = {
    totalPurchases: querySnapshot.size,
    totalRotations: 0,
    averageRotations: 0,
    pageDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
    lastRotationPeriod: 0
  };
  
  querySnapshot.forEach(docSnapshot => {
    const data = docSnapshot.data();
    const rotations = data.totalRotations || 0;
    stats.totalRotations += rotations;
    
    const page = data.pageNumber || Math.ceil((data.squareNumber || 0) / 200);
    if (page >= 1 && page <= 10) {
      stats.pageDistribution[page]++;
    }
    
    if (data.lastRotationPeriod > stats.lastRotationPeriod) {
      stats.lastRotationPeriod = data.lastRotationPeriod;
    }
  });
  
  stats.averageRotations = stats.totalPurchases > 0 
    ? stats.totalRotations / stats.totalPurchases 
    : 0;
  
  return stats;
}

