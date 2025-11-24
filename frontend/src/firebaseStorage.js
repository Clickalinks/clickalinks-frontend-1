// src/firebaseStorage.js
import { storage } from './firebase';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

// Save logo to Firebase Storage
export const saveLogoToStorage = async (logoData, squareNumber) => {
  try {
    console.log('💾 Saving logo to Firebase Storage for square:', squareNumber);
    
    // Create a reference to the storage location
    const storageRef = ref(storage, `logos/square-${squareNumber}`);
    
    // Upload the logo data URL
    const snapshot = await uploadString(storageRef, logoData, 'data_url');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Logo saved to Firebase:', downloadURL);
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Error saving logo to Firebase:', error);
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