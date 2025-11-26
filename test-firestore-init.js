/**
 * Test Firestore initialization with different methods
 * This will help diagnose the NOT_FOUND issue
 */

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import fs from 'fs';

console.log('🧪 Testing Firestore initialization methods...\n');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    console.log('✅ Using FIREBASE_SERVICE_ACCOUNT from environment');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
  } else {
    // Read from GOOGLE_APPLICATION_CREDENTIALS file
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credPath) {
      console.log(`✅ Using GOOGLE_APPLICATION_CREDENTIALS: ${credPath}`);
      if (fs.existsSync(credPath)) {
        const credData = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(credData),
          projectId: credData.project_id
        });
        console.log(`✅ Loaded project ID: ${credData.project_id}`);
      } else {
        console.log('⚠️ Credentials file not found, using default');
        admin.initializeApp({
          credential: admin.credential.applicationDefault()
        });
      }
    } else {
      console.log('✅ Using default credentials');
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  }
}

console.log('📊 Firebase Admin initialized');
console.log(`   Project ID: ${admin.app().options.projectId || 'Not set'}\n`);

async function testFirestore() {
  try {
    // Method 1: Default Firestore
    console.log('Method 1: Using default Firestore...');
    const db1 = admin.firestore();
    console.log('✅ Firestore instance created');
    
    // Try to get database settings
    try {
      const settings = db1.settings;
      console.log(`   Settings:`, JSON.stringify(settings, null, 2));
    } catch (e) {
      console.log(`   Could not get settings: ${e.message}`);
    }
    
    // Try to write
    console.log('\n   Attempting write...');
    const testRef1 = db1.collection('purchasedSquares').doc('test-write');
    await testRef1.set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Write successful with default Firestore!');
    
    // Try to read
    const docSnap = await testRef1.get();
    if (docSnap.exists) {
      console.log('✅ Read successful!');
      console.log(`   Data:`, JSON.stringify(docSnap.data(), null, 2));
    }
    
    // Cleanup
    await testRef1.delete();
    console.log('✅ Test document deleted\n');
    
    console.log('✅ All tests passed! Firestore is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    
    if (error.code === 5) {
      console.log('\n💡 NOT_FOUND (5) error troubleshooting:');
      console.log('   1. Check Firebase Console > Firestore Database');
      console.log('   2. Verify database is CREATED (not just initialized)');
      console.log('   3. Check database LOCATION (e.g., us-central1)');
      console.log('   4. Make sure you clicked "Create Database" in Firebase Console');
      console.log('   5. Wait 2-3 minutes after creating database');
      console.log('\n   Go to: https://console.firebase.google.com/project/clickalinks-frontend/firestore');
      console.log('   Make sure you see "Your database is ready to go" message');
    } else if (error.code === 7) {
      console.log('\n💡 PERMISSION_DENIED (7) error:');
      console.log('   1. Service account needs "Cloud Datastore User" role');
      console.log('   2. Go to Google Cloud Console > IAM');
      console.log('   3. Find firebase-adminsdk service account');
      console.log('   4. Add "Cloud Datastore User" role');
    }
    
    process.exit(1);
  }
}

testFirestore();

