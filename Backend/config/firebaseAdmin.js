/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for backend operations
 */

import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Priority 1: Use service account from environment variable (JSON string)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var');
      console.log('🔑 Project ID:', serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'Not set');
    } 
    // Priority 2: Use service account JSON file (for local development)
    else {
      try {
        const serviceAccountPath = join(__dirname, '..', 'firebase-service-account.json');
        console.log('📁 Looking for service account file at:', serviceAccountPath);
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id // Explicitly set project ID
        });
        console.log('✅ Firebase Admin initialized from firebase-service-account.json');
        console.log('🔑 Project ID:', serviceAccount.project_id);
      } catch (fileError) {
        console.error('❌ Error loading service account file:', fileError.message);
        // Priority 3: Use individual environment variables
        if (process.env.FIREBASE_PROJECT_ID) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
          });
          console.log('✅ Firebase Admin initialized from environment variables');
        } 
        // Priority 4: Fallback to default credentials (with explicit project ID if available)
        else {
          const initOptions = {};
          if (process.env.FIREBASE_PROJECT_ID) {
            initOptions.projectId = process.env.FIREBASE_PROJECT_ID;
          }
          admin.initializeApp(initOptions);
          console.log('✅ Firebase Admin initialized with default credentials');
          if (process.env.FIREBASE_PROJECT_ID) {
            console.log('🔑 Project ID:', process.env.FIREBASE_PROJECT_ID);
          } else {
            console.warn('⚠️ WARNING: Project ID not set - Firestore queries may fail!');
            console.warn('⚠️ Set FIREBASE_PROJECT_ID environment variable on Render.com');
          }
        }
      }
    }
    
    console.log('✅ Firebase Admin initialized successfully');
    console.log('🔑 Project ID:', admin.app().options.projectId || 'Not set');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

export default admin;

