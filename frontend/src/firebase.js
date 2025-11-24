// Firebase.js - USE YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ⚠️ REPLACE THESE WITH YOUR ACTUAL VALUES FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "XsxVvIS4mIRSzDzG2RtsbJ_I1p25-rjuupbwWCffz6g", // YOUR REAL API KEY
  authDomain: "clickalinks-frontend.firebaseapp.com", // YOUR REAL DOMAIN
  projectId: "clickalinks-frontend", // YOUR REAL PROJECT ID
  storageBucket: "clickalinks-frontend.firebasestorage.app", // YOUR REAL STORAGE BUCKET
  messagingSenderId: "568043553622", // YOUR REAL SENDER ID
  appId: "1:568043553622:web:d8e928c8b26e2847e50cf7"
 // YOUR REAL APP ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);