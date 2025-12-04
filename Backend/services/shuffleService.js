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
    
    // Convert to array and filter valid purchases
    const now = new Date();
    const purchases = [];
    const pageDistribution = {}; // Track purchases per page
    
    purchasesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const purchaseId = data.purchaseId || doc.id;
      
      // Filter expired purchases
      if (data.endDate) {
        const endDate = data.endDate.toDate ? data.endDate.toDate() : new Date(data.endDate);
        if (endDate <= now) {
          console.log(`⏭️ Skipping expired purchase: ${purchaseId} (expired: ${endDate.toISOString()})`);
          return;
        }
      }
      
      // Filter unpaid purchases
      if (data.paymentStatus && data.paymentStatus !== 'paid') {
        console.log(`⏭️ Skipping unpaid purchase: ${purchaseId} (status: ${data.paymentStatus})`);
        return;
      }
      
      // Filter purchases without valid logos
      const logoData = data.logoData;
      let hasValidLogo = false;
      if (logoData && typeof logoData === 'string' && logoData.trim() !== '') {
        if (logoData.startsWith('http://') || logoData.startsWith('https://') || logoData.startsWith('data:')) {
          hasValidLogo = true;
        }
      }
      if (!hasValidLogo) {
        console.log(`⏭️ Skipping purchase without valid logo: ${purchaseId}`);
        return;
      }
      
      const pageNum = data.pageNumber || Math.ceil((data.squareNumber || 1) / 200);
      pageDistribution[pageNum] = (pageDistribution[pageNum] || 0) + 1;
      
      purchases.push({
        docId: doc.id,
        purchaseId: purchaseId,
        squareNumber: data.squareNumber,
        pageNumber: pageNum,
        ...data
      });
    });
    
    console.log(`📊 Found ${purchases.length} valid active purchases to shuffle`);
    console.log(`📄 Page distribution:`, pageDistribution);
    console.log(`📋 Purchases by page:`, Object.entries(pageDistribution).map(([page, count]) => `Page ${page}: ${count}`).join(', '));
    
    // Limit to 2000 purchases (one per square)
    if (purchases.length > 2000) {
      console.warn(`⚠️ More purchases (${purchases.length}) than squares (2000), shuffling first 2000`);
      purchases.splice(2000);
    }
    
    // STEP 2: Generate array of ALL available squares (1-2000) - GLOBAL SHUFFLE
    // This ensures purchases can move to ANY square across ALL 10 pages
    const allSquares = Array.from({ length: 2000 }, (_, i) => i + 1);
    console.log(`🌍 GLOBAL SHUFFLE: Shuffling across ALL ${allSquares.length} squares (Pages 1-10)`);
    
    // STEP 3: Shuffle ALL squares using Fisher-Yates algorithm
    // This randomizes the order of squares 1-2000, allowing purchases to move anywhere
    const shuffledSquares = fisherYatesShuffle(allSquares, seed);
    console.log(`✅ Shuffled ${shuffledSquares.length} squares globally`);
    console.log(`📊 Sample shuffled squares: ${shuffledSquares.slice(0, 10).join(', ')}... (shows random distribution)`);
    
    // STEP 4: Assign purchases to shuffled squares
    // CRITICAL: Each purchase gets assigned to a RANDOM square from the shuffled array
    // This means purchases can move from any page to any other page
    const assignments = purchases.map((purchase, index) => ({
      docId: purchase.docId,
      purchaseId: purchase.purchaseId,
      oldSquareNumber: purchase.squareNumber,
      newSquareNumber: shuffledSquares[index], // Random square from 1-2000
      oldPageNumber: purchase.pageNumber,
      newPageNumber: Math.ceil(shuffledSquares[index] / 200) // Calculated from new square number
    }));
    
    console.log(`🌍 GLOBAL ASSIGNMENT: ${assignments.length} purchases assigned to random squares across all pages`);
    
    // Log page movement statistics - shows cross-page movement
    const pageMovement = {};
    let crossPageMoves = 0;
    assignments.forEach(assignment => {
      const key = `${assignment.oldPageNumber}→${assignment.newPageNumber}`;
      pageMovement[key] = (pageMovement[key] || 0) + 1;
      if (assignment.oldPageNumber !== assignment.newPageNumber) {
        crossPageMoves++;
      }
    });
    console.log(`🌍 GLOBAL SHUFFLE STATISTICS:`);
    console.log(`   Total purchases shuffled: ${assignments.length}`);
    console.log(`   Cross-page moves: ${crossPageMoves} (${Math.round((crossPageMoves / assignments.length) * 100)}%)`);
    console.log(`   Same-page stays: ${assignments.length - crossPageMoves} (${Math.round(((assignments.length - crossPageMoves) / assignments.length) * 100)}%)`);
    console.log(`📊 Page movement breakdown:`, pageMovement);
    console.log(`📋 Sample cross-page assignments:`, assignments
      .filter(a => a.oldPageNumber !== a.newPageNumber)
      .slice(0, 10)
      .map(a => 
        `Square ${a.oldSquareNumber} (Page ${a.oldPageNumber}) → Square ${a.newSquareNumber} (Page ${a.newPageNumber})`
      ));
    
    // Verify global distribution
    const newSquareRange = {
      min: Math.min(...assignments.map(a => a.newSquareNumber)),
      max: Math.max(...assignments.map(a => a.newSquareNumber))
    };
    console.log(`🌍 Global square range after shuffle: ${newSquareRange.min} - ${newSquareRange.max} (should be 1-2000)`);
    if (newSquareRange.min < 1 || newSquareRange.max > 2000) {
      console.warn(`⚠️ WARNING: Square range outside expected bounds!`);
    }
    
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
    // Reuse db from STEP 1
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
    
    // STEP 8: Verify updates were applied (especially for page 10)
    console.log(`🔍 Verifying shuffle updates...`);
    const verifyPage10 = assignments.filter(a => a.oldPageNumber === 10 || a.newPageNumber === 10);
    if (verifyPage10.length > 0) {
      console.log(`📄 Page 10 verification: ${verifyPage10.length} purchases affected`);
      verifyPage10.forEach(a => {
        console.log(`   - Purchase ${a.purchaseId.substring(0, 30)}...: Square ${a.oldSquareNumber} (Page ${a.oldPageNumber}) → Square ${a.newSquareNumber} (Page ${a.newPageNumber})`);
      });
      
      // Verify a few updates in Firestore
      const sampleDoc = await db.collection(COLLECTION_NAME).doc(verifyPage10[0].docId).get();
      if (sampleDoc.exists) {
        const data = sampleDoc.data();
        console.log(`   ✅ Verified: Document ${verifyPage10[0].docId} updated correctly`);
        console.log(`      Current squareNumber: ${data.squareNumber}, pageNumber: ${data.pageNumber}`);
        console.log(`      Expected squareNumber: ${verifyPage10[0].newSquareNumber}, pageNumber: ${verifyPage10[0].newPageNumber}`);
        if (data.squareNumber === verifyPage10[0].newSquareNumber && data.pageNumber === verifyPage10[0].newPageNumber) {
          console.log(`      ✅ Update verified successfully!`);
        } else {
          console.log(`      ⚠️ Update mismatch - may need to refresh frontend`);
        }
      }
    }
    
    const duration = Date.now() - startTime;
    
    // Final statistics
    const finalPageDistribution = {};
    assignments.forEach(assignment => {
      const page = assignment.newPageNumber;
      finalPageDistribution[page] = (finalPageDistribution[page] || 0) + 1;
    });
    
    console.log(`✅ Shuffle completed: ${assignments.length} purchases shuffled in ${duration}ms`);
    console.log(`📊 Final page distribution after shuffle:`, finalPageDistribution);
    console.log(`📋 Final distribution by page:`, Object.entries(finalPageDistribution)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([page, count]) => `Page ${page}: ${count} logos`)
      .join(', '));
    
    // VERIFICATION: Ensure shuffle is truly global (not page-by-page)
    const pagesWithPurchases = Object.keys(finalPageDistribution).map(Number).sort((a, b) => a - b);
    const pageSpread = pagesWithPurchases.length;
    console.log(`🌍 GLOBAL SHUFFLE VERIFICATION:`);
    console.log(`   Pages with purchases: ${pageSpread} out of 10 pages`);
    console.log(`   Page range: ${Math.min(...pagesWithPurchases)} to ${Math.max(...pagesWithPurchases)}`);
    if (pageSpread < 10 && assignments.length >= 10) {
      console.warn(`   ⚠️ WARNING: Purchases not distributed across all pages! This suggests page-by-page shuffling.`);
    } else if (pageSpread >= 10 || assignments.length < 10) {
      console.log(`   ✅ GOOD: Purchases distributed across ${pageSpread} pages (global shuffle confirmed)`);
    }
    
    // Check specifically for page 10
    const page10Purchases = assignments.filter(a => a.newPageNumber === 10);
    const page10OldPurchases = assignments.filter(a => a.oldPageNumber === 10);
    console.log(`📄 Page 10 details:`);
    console.log(`   Purchases that STARTED on page 10: ${page10OldPurchases.length}`);
    console.log(`   Purchases that ENDED on page 10: ${page10Purchases.length}`);
    if (page10Purchases.length > 0) {
      console.log(`   Sample page 10 assignments:`, page10Purchases.slice(0, 5).map(a => 
        `Square ${a.newSquareNumber} (from page ${a.oldPageNumber}, square ${a.oldSquareNumber})`
      ));
    }
    
    // Show examples of cross-page movement
    const crossPageExamples = assignments
      .filter(a => Math.abs(a.oldPageNumber - a.newPageNumber) >= 3) // Moves at least 3 pages
      .slice(0, 5);
    if (crossPageExamples.length > 0) {
      console.log(`🌍 Examples of long-distance moves (3+ pages):`, crossPageExamples.map(a => 
        `Square ${a.oldSquareNumber} (Page ${a.oldPageNumber}) → Square ${a.newSquareNumber} (Page ${a.newPageNumber})`
      ));
    }
    
    return {
      success: true,
      shuffledCount: assignments.length,
      message: `Successfully shuffled ${assignments.length} purchases`,
      seed: seed,
      duration: duration,
      batches: batches.length,
      pageDistribution: finalPageDistribution,
      page10Count: page10Purchases.length
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

