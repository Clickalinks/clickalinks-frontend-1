/**
 * Click Tracking Utility
 * Tracks business logo clicks for analytics
 */

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, increment, query, where, getDocs } from 'firebase/firestore';

/**
 * Track a click on a business logo
 * @param {number} squareNumber - The square number that was clicked
 * @param {string} businessName - Name of the business
 * @param {string} dealLink - The URL that was opened
 * @param {number} pageNumber - The page number where click occurred
 */
export const trackClick = async (squareNumber, businessName, dealLink, pageNumber) => {
  try {
    // Don't block UI - fire and forget
    const clickData = {
      squareNumber,
      businessName,
      dealLink,
      pageNumber,
      clickedAt: serverTimestamp(),
      userAgent: navigator.userAgent.substring(0, 200), // Limit length
      referrer: document.referrer || 'direct'
    };

    // Add to clickAnalytics collection
    await addDoc(collection(db, 'clickAnalytics'), clickData);

    // Update click count in purchasedSquares document
    // Note: With new purchaseId system, we need to query by squareNumber field
    try {
      const squareQuery = query(
        collection(db, 'purchasedSquares'),
        where('squareNumber', '==', squareNumber),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(squareQuery);
      
      // Update all matching documents (should only be one)
      const updatePromises = [];
      querySnapshot.forEach((docSnapshot) => {
        updatePromises.push(
          updateDoc(docSnapshot.ref, {
            clickCount: increment(1),
            lastClickAt: serverTimestamp()
          })
        );
      });
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    } catch (updateError) {
      // Non-critical - analytics still tracked
      console.warn('Could not update square click count:', updateError);
    }

    console.log(`✅ Click tracked: Square ${squareNumber} (${businessName})`);
  } catch (error) {
    // Fail silently - don't break user experience
    console.error('❌ Error tracking click:', error);
  }
};

/**
 * Get click statistics for a square
 * @param {number} squareNumber - The square number
 * @returns {Promise<{totalClicks: number, lastClickAt: Date}>}
 */
export const getClickStats = async (squareNumber) => {
  try {
    const squareDocRef = doc(db, 'purchasedSquares', squareNumber.toString());
    const squareDoc = await getDoc(squareDocRef);
    
    if (squareDoc.exists()) {
      const data = squareDoc.data();
      return {
        totalClicks: data.clickCount || 0,
        lastClickAt: data.lastClickAt?.toDate() || null
      };
    }
    
    return { totalClicks: 0, lastClickAt: null };
  } catch (error) {
    console.error('Error getting click stats:', error);
    return { totalClicks: 0, lastClickAt: null };
  }
};

