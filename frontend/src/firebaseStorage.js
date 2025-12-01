// src/firebaseStorage.js
import { storage } from './firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

// Generate unique purchase ID for logo storage
const generatePurchaseId = () => {
  // Generate a unique ID: timestamp + random string
  return `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Save logo to Firebase Storage
export const saveLogoToStorage = async (logoData, purchaseId = null) => {
  try {
    // Generate unique purchase ID if not provided
    const uniquePurchaseId = purchaseId || generatePurchaseId();
    console.log('💾 Saving logo to Firebase Storage with purchase ID:', uniquePurchaseId);
    console.log('📊 Logo data type:', logoData ? (logoData.startsWith('data:') ? 'Data URL' : logoData.startsWith('http') ? 'HTTP URL' : 'Unknown') : 'NULL');
    
    // If it's already a URL (not a data URL), return it as-is (but as object for consistency)
    if (logoData && logoData.startsWith('http') && !logoData.startsWith('data:')) {
      console.log('✅ Logo is already a URL, skipping upload:', logoData);
      return {
        url: logoData,
        path: null, // No storage path for external URLs
        purchaseId: uniquePurchaseId
      };
    }
    
    // Validate it's a data URL
    if (!logoData || !logoData.startsWith('data:')) {
      console.error('❌ Invalid logo data format. Expected data URL, got:', logoData ? logoData.substring(0, 50) : 'null');
      throw new Error('Invalid logo data format. Please upload an image file.');
    }
    
    // Create a reference to the storage location with unique purchase ID
    // This ensures logo persists even when square number changes during shuffle
    const timestamp = Date.now();
    const storagePath = `logos/${uniquePurchaseId}-${timestamp}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload the logo data URL
    console.log('📤 Uploading to Firebase Storage...');
    const snapshot = await uploadString(storageRef, logoData, 'data_url');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Logo saved to Firebase Storage successfully!');
    console.log('🔗 Download URL:', downloadURL);
    console.log('📁 Storage Path:', storagePath);
    
    // Return URL, path, and purchase ID for reference
    return {
      url: downloadURL,
      path: storagePath,
      purchaseId: uniquePurchaseId
    };
    
  } catch (error) {
    console.error('❌ Error saving logo to Firebase Storage:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Firebase Storage: Unauthorized. Please check Firebase Storage security rules.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Firebase Storage: Quota exceeded. Please check your Firebase plan.');
    } else if (error.code === 'storage/unauthenticated') {
      throw new Error('Firebase Storage: Authentication required. Please check Firebase configuration.');
    }
    
    throw error;
  }
};

// Get logo URL from Firebase Storage
export const getLogoFromStorage = async (squareNumber) => {
  try {
    const storageRef = ref(storage, `logos/square-${squareNumber}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error getting logo from Firebase:', error);
    return null;
  }
};

// Delete logo from storage
export const deleteLogoFromStorage = async (squareNumber) => {
  try {
    const storageRef = ref(storage, `logos/square-${squareNumber}`);
    await deleteObject(storageRef);
    console.log('✅ Logo deleted from Firebase');
  } catch (error) {
    console.error('❌ Error deleting logo:', error);
  }
};