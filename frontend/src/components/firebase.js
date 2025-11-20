import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0PbqFaI4_p4q4dLPDJqaV4wlZ-R-Zqk8",
  authDomain: "clickalinks-frontend.firebaseapp.com",
  projectId: "clickalinks-frontend", // FIXED: Remove "-b5149"
  storageBucket: "clickalinks-frontend.firebasestorage.app",
  messagingSenderId: "568043553622",
  appId: "1:568043553622:web:d8e928c8b26e2847e50cf7",
  measurementId: "G-T2N4M7D8X4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

export default app;