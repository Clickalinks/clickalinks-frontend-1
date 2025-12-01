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
    // Priority 1: Use service account from environment variable (JSON string or Base64)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        let jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        console.log('🔍 Processing FIREBASE_SERVICE_ACCOUNT (length:', jsonString.length, 'chars)');
        console.log('🔍 First 50 chars:', jsonString.substring(0, 50));
        
        // CRITICAL: ALWAYS try Base64 decode FIRST if it doesn't start with { or [
        // This is the most reliable way to detect Base64
        const startsWithJson = jsonString.startsWith('{') || jsonString.startsWith('[');
        
        if (!startsWithJson) {
          // Doesn't start with JSON - likely Base64, try decoding
          console.log('🔍 String does NOT start with { or [, attempting Base64 decode...');
          try {
            const decoded = Buffer.from(jsonString, 'base64').toString('utf-8');
            console.log('🔍 Base64 decode successful, decoded length:', decoded.length);
            console.log('🔍 Decoded first 50 chars:', decoded.substring(0, 50));
            
            // Verify it decoded to valid JSON-like content
            if (decoded.trim().startsWith('{') || decoded.trim().startsWith('[')) {
              jsonString = decoded;
              console.log('✅ Base64 detected and decoded successfully!');
            } else {
              console.log('⚠️ Base64 decode didn\'t produce JSON, will try raw parse');
            }
          } catch (base64Error) {
            console.log('⚠️ Base64 decode failed:', base64Error.message, '- treating as raw JSON');
            // Continue with original string - might be raw JSON
          }
        } else {
          console.log('ℹ️ String starts with { or [, treating as raw JSON');
        }
        
        // Remove any surrounding quotes if present
        if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
            (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
          jsonString = jsonString.slice(1, -1);
        }
        
        // Now try to parse as JSON
        console.log('🔍 Attempting JSON.parse...');
        const serviceAccount = JSON.parse(jsonString);
        
        // Validate required fields
        if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
          throw new Error('Service account JSON is missing required fields (private_key, client_email, or project_id)');
        }
        
        const projectId = serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'clickalinks-frontend';
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId // ALWAYS set projectId explicitly
        });
        console.log('✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT env var');
        console.log('🔑 Project ID:', projectId);
      } catch (parseError) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        console.error('❌ JSON parse error at position:', parseError.message.match(/position (\d+)/)?.[1] || 'unknown');
        console.error('❌ First 500 chars of JSON:', process.env.FIREBASE_SERVICE_ACCOUNT.substring(0, 500));
        console.error('❌ Falling back to default credentials...');
        // Don't throw - let it fall through to Priority 4 (default credentials)
        // This allows the app to start even if JSON is malformed
      }
    }
    
    // If Priority 1 failed or wasn't set, continue to Priority 2
    if (!admin.apps.length) {
      // Priority 2: Use service account JSON file (for local development)
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
        
        // Priority 3: Use individual environment variables (SKIP on Render.com - use default credentials instead)
        // On Render.com, we should use default credentials (Priority 4) or service account JSON (Priority 1)
        const isRender = process.env.RENDER || process.env.RENDER_SERVICE_NAME;
        let useIndividualEnvVars = false;
        let projectId = process.env.FIREBASE_PROJECT_ID || 'clickalinks-frontend';
        
        // Skip Priority 3 on Render.com - go straight to default credentials
        if (!isRender) {
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
              const privateKey = envPrivateKey.replace(/\\n/g, '\n').trim();
              
              // STRICT validation: must have BEGIN, END, and be substantial length
              const hasBegin = privateKey.includes('BEGIN PRIVATE KEY') || privateKey.includes('BEGIN RSA PRIVATE KEY');
              const hasEnd = privateKey.includes('END PRIVATE KEY') || privateKey.includes('END RSA PRIVATE KEY');
              const isValidLength = privateKey.length > 1000; // Private keys are typically 1500+ characters
              
              if (hasBegin && hasEnd && isValidLength) {
                // All validations passed - try to use individual env vars
                try {
                  admin.initializeApp({
                    credential: admin.credential.cert({
                      projectId: envProjectId.trim(),
                      clientEmail: envClientEmail.trim(),
                      privateKey: privateKey
                    }),
                    projectId: envProjectId.trim()
                  });
                  console.log('✅ Firebase Admin initialized from environment variables');
                  console.log('🔑 Project ID:', envProjectId.trim());
                  useIndividualEnvVars = true;
                } catch (credError) {
                  console.error('❌ Error initializing with individual env vars:', credError.message);
                  console.error('❌ Error code:', credError.code || 'unknown');
                  useIndividualEnvVars = false;
                }
              } else {
                console.warn('⚠️ Private key validation failed - missing BEGIN/END markers or too short');
                useIndividualEnvVars = false;
              }
            }
          } catch (validationError) {
            console.error('❌ Error validating environment variables:', validationError.message);
            useIndividualEnvVars = false;
          }
        } else {
          console.log('ℹ️ Running on Render.com - skipping individual env vars, using default credentials');
        }
        
        // Priority 4: Fallback to default credentials (with explicit project ID)
        // This is the preferred method for Render.com deployments
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

