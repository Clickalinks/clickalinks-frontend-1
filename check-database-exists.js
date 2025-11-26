/**
 * Check if Firestore database exists and is accessible
 */

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import fs from 'fs';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath && fs.existsSync(credPath)) {
    const credData = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(credData),
      projectId: credData.project_id
    });
    console.log(`✅ Firebase Admin initialized: ${credData.project_id}\n`);
  }
}

const db = admin.firestore();

async function checkDatabase() {
  console.log('🔍 Checking Firestore database status...\n');
  
  try {
    // Try to get database info
    console.log('Test 1: Checking if we can access Firestore...');
    
    // Try a simple operation - list collections (this will fail if database doesn't exist)
    try {
      const collections = await db.listCollections();
      console.log(`✅ Database exists! Found ${collections.length} collection(s)`);
      collections.forEach(col => {
        console.log(`   - ${col.id}`);
      });
    } catch (listError) {
      if (listError.code === 5) {
        console.log('⚠️ Cannot list collections - database might not exist or not be accessible');
        console.log('   This usually means:');
        console.log('   1. Database was never created in Firebase Console');
        console.log('   2. OR database is in a different region');
        console.log('   3. OR permissions haven\'t propagated yet (wait 2-3 minutes)');
      } else {
        throw listError;
      }
    }
    
    // Try to write a test document
    console.log('\nTest 2: Attempting to write test document...');
    const testRef = db.collection('_test_backend').doc('connection-test');
    
    try {
      await testRef.set({
        test: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        message: 'Backend connection test'
      });
      console.log('✅ Write successful! Database is accessible.');
      
      // Try to read it back
      const docSnap = await testRef.get();
      if (docSnap.exists) {
        console.log('✅ Read successful!');
        console.log(`   Document data:`, JSON.stringify(docSnap.data(), null, 2));
      }
      
      // Cleanup
      await testRef.delete();
      console.log('✅ Test document deleted');
      
    } catch (writeError) {
      if (writeError.code === 5) {
        console.log('❌ Write failed with NOT_FOUND');
        console.log('\n💡 SOLUTION:');
        console.log('   1. Go to Firebase Console: https://console.firebase.google.com/project/clickalinks-frontend/firestore');
        console.log('   2. Make sure you see "Your database is ready to go" message');
        console.log('   3. If you see "Create Database" button, click it');
        console.log('   4. Choose "Start in production mode" (or test mode)');
        console.log('   5. Select a location (e.g., us-central1)');
        console.log('   6. Click "Enable"');
        console.log('   7. Wait 2-3 minutes for database to initialize');
        console.log('   8. Then run this test again');
      } else {
        throw writeError;
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
  }
}

checkDatabase();

