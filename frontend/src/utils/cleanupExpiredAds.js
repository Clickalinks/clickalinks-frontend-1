// Utility to clean up expired ads from Firestore and Storage
import { db, storage } from '../firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

/**
 * Clean up expired ads - removes from Firestore and deletes logos from Storage
 */
export const cleanupExpiredAds = async () => {
  try {
    console.log('🧹 Starting cleanup of expired ads...');
    const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
    const now = new Date();
    let cleanedCount = 0;
    let deletedLogos = 0;

    const cleanupPromises = [];

    querySnapshot.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      const squareId = docSnapshot.id;

      // Check if ad has expired
      if (data && data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= now) {
          console.log(`🗑️ Cleaning up expired ad for square ${squareId}`);
          
          // Delete from Firestore
          const deletePromise = deleteDoc(doc(db, 'purchasedSquares', squareId))
            .then(() => {
              console.log(`✅ Deleted Firestore document for square ${squareId}`);
              cleanedCount++;
            })
            .catch((error) => {
              console.error(`❌ Error deleting Firestore doc for square ${squareId}:`, error);
            });

          // Delete logo from Storage if it exists
          if (data.logoData && data.logoData.includes('firebasestorage')) {
            // Use stored path or try to find files
            const storagePath = data.storagePath || `logos/square-${squareId}`;
            
            // Try to delete all versions of the logo (with timestamps)
            const deleteStoragePromise = (async () => {
              try {
                // First try to delete using stored path
                if (data.storagePath) {
                  try {
                    const fileRef = ref(storage, data.storagePath);
                    await deleteObject(fileRef);
                    console.log(`✅ Deleted storage file: ${data.storagePath}`);
                    deletedLogos++;
                  } catch (pathError) {
                    console.log(`⚠️ Could not delete using stored path, trying list method...`);
                  }
                }
                
                // Also try to list and delete all files matching this square
                try {
                  const logosRef = ref(storage, 'logos');
                  const listResult = await listAll(logosRef);
                  
                  // Find and delete files matching this square
                  const deletePromises = listResult.items
                    .filter(item => item.name.startsWith(`square-${squareId}`))
                    .map(item => {
                      console.log(`🗑️ Deleting storage file: ${item.name}`);
                      return deleteObject(item)
                        .then(() => {
                          console.log(`✅ Deleted storage file: ${item.name}`);
                          deletedLogos++;
                        })
                        .catch((error) => {
                          // File might already be deleted, ignore error
                          if (error.code !== 'storage/object-not-found') {
                            console.error(`❌ Error deleting storage file ${item.name}:`, error);
                          }
                        });
                    });
                  
                  await Promise.all(deletePromises);
                } catch (listError) {
                  console.error(`❌ Error listing storage files:`, listError);
                }
              } catch (storageError) {
                console.error(`❌ Error accessing storage for square ${squareId}:`, storageError);
              }
            })();

            cleanupPromises.push(deleteStoragePromise);
          }

          cleanupPromises.push(deletePromise);
        }
      }
    });

    await Promise.all(cleanupPromises);

    // Also clean up localStorage
    const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    let localCleaned = 0;
    
    Object.keys(localPurchases).forEach(squareNum => {
      const localData = localPurchases[squareNum];
      if (localData && localData.endDate) {
        const endDate = new Date(localData.endDate);
        if (endDate <= now) {
          delete localPurchases[squareNum];
          localCleaned++;
        }
      }
    });
    
    if (localCleaned > 0) {
      localStorage.setItem('squarePurchases', JSON.stringify(localPurchases));
      console.log(`✅ Cleaned ${localCleaned} expired ads from localStorage`);
    }

    console.log(`✅ Cleanup complete: ${cleanedCount} ads removed, ${deletedLogos} logos deleted`);
    return { cleanedCount, deletedLogos, localCleaned };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
};

/**
 * Mark expired ads as inactive (alternative to deletion)
 */
export const markExpiredAdsInactive = async () => {
  try {
    console.log('🔄 Marking expired ads as inactive...');
    const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
    const now = new Date();
    let markedCount = 0;

    const updatePromises = [];

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data && data.status === 'active' && data.endDate) {
        const endDate = new Date(data.endDate);
        if (endDate <= now) {
          const updatePromise = updateDoc(doc(db, 'purchasedSquares', docSnapshot.id), {
            status: 'expired',
            expiredAt: new Date().toISOString()
          })
            .then(() => {
              console.log(`✅ Marked square ${docSnapshot.id} as expired`);
              markedCount++;
            })
            .catch((error) => {
              console.error(`❌ Error marking square ${docSnapshot.id} as expired:`, error);
            });

          updatePromises.push(updatePromise);
        }
      }
    });

    await Promise.all(updatePromises);
    console.log(`✅ Marked ${markedCount} ads as expired`);
    return { markedCount };
  } catch (error) {
    console.error('❌ Error marking expired ads:', error);
    throw error;
  }
};

