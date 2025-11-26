/**
 * Backend Shuffle Service
 * Implements Fisher-Yates shuffle algorithm on the backend
 * Ensures global consistency and prevents client-side conflicts
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id // Explicitly set project ID
    });
  } else {
    // Fallback: use default credentials (for local development)
    // Try to read from GOOGLE_APPLICATION_CREDENTIALS file
    try {
      const fs = await import('fs');
      const path = await import('path');
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (credPath && fs.existsSync(credPath)) {
        const credData = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(credData),
          projectId: credData.project_id
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      }
    } catch (e) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  }
}

// Initialize Firestore with explicit database (default database)
// If you have multiple databases, specify the database ID
const db = admin.firestore();
// For default database, use: admin.firestore()
// For named database, use: admin.firestore(app, 'database-id')
const COLLECTION_NAME = 'purchasedSquares'; // Standard camelCase convention

/**
 * Fisher-Yates Shuffle Algorithm
 * Shuffles an array in-place using the Fisher-Yates algorithm
 * Time Complexity: O(n) - optimal for shuffling
 * 
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array (same reference, shuffled in place)
 */
function fisherYatesShuffle(array) {
  const shuffled = [...array]; // Create copy to avoid mutation
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const randomIndex = Math.floor(Math.random() * (i + 1));
    
    // Swap current element with randomly selected element
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Perform global shuffle of all active purchases
 * Fetches all 2000 documents, shuffles them, assigns orderingIndex (0-1999)
 * and writes back to Firestore using batch writes
 * 
 * @returns {Object} - Result object with success status and details
 */
export async function performGlobalShuffle() {
  const startTime = Date.now();
  console.log('🔄 Starting global shuffle...');
  
  try {
    // Step 1: Fetch all active purchases
    console.log('📥 Fetching all active purchases from Firestore...');
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
    } catch (error) {
      // Handle case where collection doesn't exist yet (NOT_FOUND error)
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet. No purchases to shuffle.');
        return {
          success: true,
          message: 'Collection does not exist yet. No purchases to shuffle.',
          shuffledCount: 0,
          duration: Date.now() - startTime
        };
      }
      // Re-throw other errors
      throw error;
    }
    
    if (snapshot.empty) {
      console.log('⚠️ No active purchases found. Nothing to shuffle.');
      return {
        success: true,
        message: 'No active purchases to shuffle',
        shuffledCount: 0,
        duration: Date.now() - startTime
      };
    }
    
    const purchases = [];
    snapshot.forEach(doc => {
      purchases.push({
        id: doc.id,
        data: doc.data()
      });
    });
    
    console.log(`✅ Fetched ${purchases.length} active purchases`);
    
    // Step 2: Filter out purchases without confirmed payment
    const activePurchases = purchases.filter(p => {
      const data = p.data;
      return data.paymentStatus === 'paid' && 
             data.status === 'active' &&
             data.logoData && // Must have a logo
             data.logoData.trim() !== '';
    });
    
    console.log(`✅ Filtered to ${activePurchases.length} purchases with confirmed payment and logos`);
    
    if (activePurchases.length === 0) {
      console.log('⚠️ No purchases with confirmed payment and logos found.');
      return {
        success: true,
        message: 'No purchases with confirmed payment and logos to shuffle',
        shuffledCount: 0,
        duration: Date.now() - startTime
      };
    }
    
    // Step 3: Run Fisher-Yates shuffle
    console.log('🔀 Running Fisher-Yates shuffle algorithm...');
    const shuffled = fisherYatesShuffle(activePurchases);
    console.log('✅ Shuffle completed');
    
    // Step 4: Assign orderingIndex (0 to shuffled.length - 1)
    console.log('📝 Assigning orderingIndex to each purchase...');
    const updates = shuffled.map((purchase, index) => ({
      id: purchase.id,
      orderingIndex: index,
      lastShuffled: admin.firestore.FieldValue.serverTimestamp()
    }));
    
    console.log(`✅ Assigned orderingIndex to ${updates.length} purchases`);
    
    // Step 5: Write back to Firestore using batch writes
    // Firestore batch limit is 500 operations, so we need multiple batches
    console.log('💾 Writing updates to Firestore...');
    const BATCH_SIZE = 500;
    let batchCount = 0;
    let totalUpdated = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const batchUpdates = updates.slice(i, i + BATCH_SIZE);
      
      batchUpdates.forEach(update => {
        const docRef = db.collection(COLLECTION_NAME).doc(update.id);
        batch.update(docRef, {
          orderingIndex: update.orderingIndex,
          lastShuffled: update.lastShuffled
        });
      });
      
      await batch.commit();
      batchCount++;
      totalUpdated += batchUpdates.length;
      console.log(`✅ Batch ${batchCount}: Updated ${batchUpdates.length} documents (${totalUpdated}/${updates.length})`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Global shuffle completed successfully!`);
    console.log(`   - Shuffled: ${totalUpdated} purchases`);
    console.log(`   - Batches: ${batchCount}`);
    console.log(`   - Duration: ${duration}ms`);
    
    return {
      success: true,
      message: 'Global shuffle completed successfully',
      shuffledCount: totalUpdated,
      batches: batchCount,
      duration: duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error during global shuffle:', error);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      duration: Date.now() - startTime
    };
  }
}

/**
 * Get shuffle statistics
 * Returns information about the current shuffle state
 */
export async function getShuffleStats() {
  try {
    let snapshot;
    try {
      snapshot = await db.collection(COLLECTION_NAME)
        .where('status', '==', 'active')
        .get();
    } catch (error) {
      // Handle case where collection doesn't exist yet (NOT_FOUND error)
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet. Returning empty stats.');
        return {
          success: true,
          totalActive: 0,
          withOrderingIndex: 0,
          withoutOrderingIndex: 0,
          lastShuffled: null,
          needsShuffle: false,
          message: 'Collection does not exist yet'
        };
      }
      // Re-throw other errors
      throw error;
    }
    
    let totalActive = 0;
    let withOrderingIndex = 0;
    let withoutOrderingIndex = 0;
    let lastShuffled = null;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.paymentStatus === 'paid' && data.logoData) {
        totalActive++;
        if (data.orderingIndex !== undefined && data.orderingIndex !== null) {
          withOrderingIndex++;
          if (data.lastShuffled) {
            const shuffledTime = data.lastShuffled.toDate();
            if (!lastShuffled || shuffledTime > lastShuffled) {
              lastShuffled = shuffledTime;
            }
          }
        } else {
          withoutOrderingIndex++;
        }
      }
    });
    
    return {
      success: true,
      totalActive,
      withOrderingIndex,
      withoutOrderingIndex,
      lastShuffled: lastShuffled ? lastShuffled.toISOString() : null,
      needsShuffle: withoutOrderingIndex > 0
    };
  } catch (error) {
    console.error('❌ Error getting shuffle stats:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code
    };
  }
}

