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
      const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'clickalinks-frontend';
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId // ALWAYS set projectId explicitly
      });
      console.log('✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var');
      console.log('🔑 Project ID:', projectId);
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
        
        // Priority 3: Use individual environment variables (only if all required fields are present and valid)
        // Use try-catch to safely check environment variables
        let useIndividualEnvVars = false;
        let projectId = process.env.FIREBASE_PROJECT_ID || 'clickalinks-frontend';
        let clientEmail = null;
        let privateKey = null;
        
        try {
          // Safely check and validate environment variables
          const envProjectId = process.env.FIREBASE_PROJECT_ID;
          const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
          const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
          
          const hasProjectId = envProjectId && typeof envProjectId === 'string' && envProjectId.trim().length > 0;
          const hasClientEmail = envClientEmail && typeof envClientEmail === 'string' && envClientEmail.trim().length > 0;
          const hasPrivateKey = envPrivateKey && typeof envPrivateKey === 'string' && envPrivateKey.trim().length > 0;
          
          if (hasProjectId && hasClientEmail && hasPrivateKey) {
            // Process private key
            privateKey = envPrivateKey.replace(/\\n/g, '\n').trim();
            
            // Validate private key format - must contain BEGIN marker
            if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
              console.warn('⚠️ Private key format validation failed - missing BEGIN marker');
              useIndividualEnvVars = false;
            } else if (privateKey.length < 100) {
              console.warn('⚠️ Private key appears too short to be valid');
              useIndividualEnvVars = false;
            } else {
              // All validations passed
              projectId = envProjectId.trim();
              clientEmail = envClientEmail.trim();
              useIndividualEnvVars = true;
            }
          }
        } catch (validationError) {
          console.error('❌ Error validating environment variables:', validationError.message);
          useIndividualEnvVars = false;
        }
        
        // Try Priority 3 if validation passed
        if (useIndividualEnvVars) {
          try {
            admin.initializeApp({
              credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey
              }),
              projectId: projectId
            });
            console.log('✅ Firebase Admin initialized from environment variables');
            console.log('🔑 Project ID:', projectId);
          } catch (credError) {
            console.error('❌ Error initializing with individual env vars:', credError.message);
            console.error('❌ Error code:', credError.code || 'unknown');
            // Fall through to Priority 4
            useIndividualEnvVars = false;
          }
        }
        
        // Priority 4: Fallback to default credentials (with explicit project ID)
        // Only initialize if Priority 3 didn't succeed
        if (!useIndividualEnvVars && !admin.apps.length) {
          try {
            admin.initializeApp({
              projectId: projectId
            });
            console.log('✅ Firebase Admin initialized with default credentials');
            console.log('🔑 Project ID:', projectId);
            if (!process.env.FIREBASE_PROJECT_ID) {
              console.warn('⚠️ Using default project ID. Set FIREBASE_PROJECT_ID on Render.com for production.');
            } else {
              console.warn('⚠️ Using default credentials - individual env vars were missing or invalid');
            }
          } catch (defaultError) {
            console.error('❌ Critical: Failed to initialize Firebase Admin with default credentials:', defaultError.message);
            // Last resort: try without projectId (only if still not initialized)
            if (!admin.apps.length) {
              try {
                admin.initializeApp();
                console.log('✅ Firebase Admin initialized with minimal configuration');
              } catch (lastResortError) {
                console.error('❌ CRITICAL: Complete Firebase Admin initialization failure');
                throw lastResortError;
              }
            }
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

