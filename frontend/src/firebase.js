// Firebase.js - Uses environment variables for security
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ SECURITY: All values come from environment variables
// Create a .env file in the frontend directory with these variables:
// REACT_APP_FIREBASE_API_KEY=your_api_key
// REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
// REACT_APP_FIREBASE_PROJECT_ID=your_project_id
// REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
// REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
// REACT_APP_FIREBASE_APP_ID=your_app_id

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate that all required environment variables are set
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing! Please check your .env file.');
  throw new Error('Firebase configuration is incomplete. Check environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);