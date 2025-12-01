import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const Cancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clean up any pending purchases and uploaded logos when payment is cancelled
    const cleanupCancelledPurchase = async () => {
      console.log('🧹 Cleaning up cancelled purchase...');
      
      try {
        // Get pending purchases from localStorage
        const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
        const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
        
        // Find the cancelled purchase
        let cancelledPurchase = null;
        if (sessionId) {
          // Try to find by session ID
          cancelledPurchase = Object.values(pendingPurchases).find(p => p.sessionId === sessionId);
        }
        
        // If not found by session ID, use the most recent pending purchase
        if (!cancelledPurchase && Object.keys(pendingPurchases).length > 0) {
          const pendingKeys = Object.keys(pendingPurchases);
          cancelledPurchase = pendingPurchases[pendingKeys[pendingKeys.length - 1]];
        }
        
        // If still not found, use businessFormData
        if (!cancelledPurchase && businessFormData.squareNumber) {
          cancelledPurchase = businessFormData;
        }
        
        if (cancelledPurchase && cancelledPurchase.squareNumber) {
          const squareNumber = cancelledPurchase.squareNumber;
          console.log(`🗑️ Cleaning up cancelled purchase for square ${squareNumber}`);
          
          // CRITICAL: Delete logo from Firebase Storage if it was uploaded
          const logoPath = localStorage.getItem(`logoPath_${squareNumber}`);
          if (logoPath) {
            try {
              const storageRef = ref(storage, logoPath);
              await deleteObject(storageRef);
              console.log(`✅ Deleted logo from Firebase Storage: ${logoPath}`);
            } catch (storageError) {
              console.warn('⚠️ Could not delete logo from storage (may not exist):', storageError);
            }
            localStorage.removeItem(`logoPath_${squareNumber}`);
          }
          
          // CRITICAL: Delete from Firestore if purchase was saved there
          // This prevents logos from appearing on deployed site
          try {
            console.log(`🗑️ Checking Firestore for purchase on square ${squareNumber}...`);
            
            // Find all documents for this square number
            const squareQuery = query(
              collection(db, 'purchasedSquares'),
              where('squareNumber', '==', squareNumber)
            );
            const snapshot = await getDocs(squareQuery);
            
            let deletedCount = 0;
            snapshot.forEach(async (docSnapshot) => {
              const data = docSnapshot.data();
              // Only delete if payment is not confirmed (pending, cancelled, or missing paymentStatus)
              if (!data.paymentStatus || data.paymentStatus !== 'paid' || data.status !== 'active') {
                try {
                  await deleteDoc(doc(db, 'purchasedSquares', docSnapshot.id));
                  deletedCount++;
                  console.log(`✅ Deleted unconfirmed purchase from Firestore: ${docSnapshot.id}`);
                } catch (deleteError) {
                  console.error(`❌ Error deleting Firestore document ${docSnapshot.id}:`, deleteError);
                }
              } else {
                console.log(`⚠️ Skipping Firestore delete for ${docSnapshot.id} - payment already confirmed`);
              }
            });
            
            if (deletedCount > 0) {
              console.log(`✅ Deleted ${deletedCount} unconfirmed purchase(s) from Firestore`);
            } else {
              console.log(`ℹ️ No unconfirmed purchases found in Firestore for square ${squareNumber}`);
            }
          } catch (firestoreError) {
            console.error('❌ Error deleting from Firestore:', firestoreError);
          }
          
          // CRITICAL: Remove ALL logo-related data from localStorage
          // This prevents logos from appearing without payment
          localStorage.removeItem(`logoData_${squareNumber}`);
          localStorage.removeItem('currentLogoData');
          
          // Remove from squarePurchases (confirmed purchases)
          const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
          delete squarePurchases[squareNumber];
          localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
          
          // Remove pending purchases
          const updatedPending = { ...pendingPurchases };
          Object.keys(updatedPending).forEach(key => {
            if (updatedPending[key].squareNumber === squareNumber) {
              delete updatedPending[key];
            }
          });
          localStorage.setItem('pendingPurchases', JSON.stringify(updatedPending));
          
          // Clear business form data
          localStorage.removeItem('businessFormData');
          
          // CRITICAL: Also check if logo was saved to any other localStorage keys
          // Clean up any temporary logo storage
          const allKeys = Object.keys(localStorage);
          allKeys.forEach(key => {
            if (key.startsWith(`logoData_${squareNumber}`) || 
                (key.includes('logo') && key.includes(squareNumber.toString()))) {
              localStorage.removeItem(key);
              console.log(`🗑️ Removed logo key: ${key}`);
            }
          });
          
          // CRITICAL: Also trigger a page reload event to refresh AdGrid
          // This ensures any cached logo data is cleared from display
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('purchaseCompleted'));
          
          console.log('✅ Cleanup completed for cancelled purchase');
        } else {
          console.log('ℹ️ No cancelled purchase found to clean up');
        }
        
        // CRITICAL: Always clean up any orphaned logo data
        // Check all localStorage keys for this square number
        const allKeys = Object.keys(localStorage);
        let cleanedKeys = 0;
        allKeys.forEach(key => {
          if (key.includes('logo') && (key.includes(squareNumber?.toString() || '') || key === 'currentLogoData')) {
            localStorage.removeItem(key);
            cleanedKeys++;
          }
        });
        if (cleanedKeys > 0) {
          console.log(`🗑️ Cleaned up ${cleanedKeys} orphaned logo keys`);
        }
      } catch (error) {
        console.error('❌ Error during cleanup:', error);
      }
    };

    cleanupCancelledPurchase();
  }, [sessionId]);

  return (
    <div className="cancel-container">
      <div className="cancel-content">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made.</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
          Any uploaded logos have been removed.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Grid
        </button>
      </div>
    </div>
  );
};

export default Cancel;
