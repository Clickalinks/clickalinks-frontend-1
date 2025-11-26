/**
 * Check Firebase Project ID from Service Account
 */

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

console.log('🔍 Checking Firebase Project Configuration...\n');

// Try to read the service account file
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  'C:\\Clickalinks\\Backend\\firebase-service-account.json';

console.log(`📁 Looking for service account at: ${serviceAccountPath}\n`);

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    console.log('✅ Service Account File Found!\n');
    console.log('📊 Project Information:');
    console.log(`   Project ID: ${serviceAccount.project_id}`);
    console.log(`   Client Email: ${serviceAccount.client_email}`);
    console.log(`   Type: ${serviceAccount.type}`);
    
    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('\n✅ Firebase Admin initialized\n');
    
    // Try to get project info
    try {
      const db = admin.firestore();
      console.log('🔗 Attempting to connect to Firestore...');
      
      // Try a simple operation
      const testRef = db.collection('_test').doc('_test');
      await testRef.set({ test: true });
      await testRef.delete();
      
      console.log('✅ Firestore connection successful!');
      console.log('\n💡 The database exists and is accessible.');
      console.log('   The NOT_FOUND error might be because:');
      console.log('   1. No collections exist yet (normal for new projects)');
      console.log('   2. The purchasedSquares collection will be created on first save');
      
    } catch (error) {
      console.error('\n❌ Firestore Error:', error.message);
      console.error('   Error Code:', error.code);
      
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('\n🔧 SOLUTION:');
        console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
        console.log(`   2. Select project: ${serviceAccount.project_id}`);
        console.log('   3. Go to Firestore Database');
        console.log('   4. Click "Create Database"');
        console.log('   5. Choose "Start in test mode" (or production mode)');
        console.log('   6. Select a location (e.g., us-central1)');
        console.log('   7. Click "Enable"');
        console.log('\n   After enabling Firestore, run the test again.');
      }
    }
    
  } else {
    console.error(`❌ Service account file not found at: ${serviceAccountPath}`);
    console.log('\n💡 Make sure you copied the Firebase key file to:');
    console.log('   C:\\Clickalinks\\Backend\\firebase-service-account.json');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\n🔍 Troubleshooting:');
  console.error('1. Check that the service account file exists');
  console.error('2. Verify the file is valid JSON');
  console.error('3. Make sure you have the correct Firebase project key');
}

