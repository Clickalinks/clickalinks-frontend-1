/**
 * Click Tracking Utility
 * Tracks business logo clicks for analytics
 */

import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

/**
 * Track a click on a business logo
 * @param {number} squareNumber - The square number that was clicked
 * @param {string} businessName - Name of the business
 * @param {string} dealLink - The URL that was opened
 * @param {number} pageNumber - The page number where click occurred
 */
export const trackClick = async (squareNumber, businessName, dealLink, pageNumber) => {
  try {
    // SECURITY: Use backend API instead of direct Firestore writes
    // Don't block UI - fire and forget
    const clickData = {
      squareNumber,
      businessName: businessName || '',
      dealLink: dealLink || '',
      pageNumber: pageNumber || 1
    };

    // Call backend API (fire and forget - don't wait for response)
    fetch(`${BACKEND_URL}/api/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clickData)
    }).catch(error => {
      // Fail silently - don't break user experience
      console.warn('Click tracking failed (non-critical):', error);
    });

    console.log(`✅ Click tracking sent: Square ${squareNumber} (${businessName})`);
  } catch (error) {
    // Fail silently - don't break user experience
    console.warn('❌ Error tracking click:', error);
  }
};

/**
 * Get click statistics for a square
 * @param {number} squareNumber - The square number
 * @returns {Promise<{totalClicks: number, lastClickAt: Date}>}
 */
// Note: getClickStats still uses direct Firestore reads (allowed by security rules)
// Only writes are restricted - reads are public
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

