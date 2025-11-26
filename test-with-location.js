/**
 * Test Firestore with explicit database location
 * Database is in europe-west2 region
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

async function testWithLocation() {
  console.log('🔍 Testing Firestore with europe-west2 location...\n');
  
  try {
    // Try both collection names (lowercase and camelCase)
    const collections = ['purchasedsquares', 'purchasedSquares'];
    
    for (const collectionName of collections) {
      console.log(`\n📁 Testing collection: ${collectionName}`);
      
      try {
        // Try to write
        const testRef = db.collection(collectionName).doc('backend-test');
        await testRef.set({
          test: true,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          message: 'Backend connection test',
          collection: collectionName
        });
        console.log(`✅ Write successful to ${collectionName}!`);
        
        // Try to read
        const docSnap = await testRef.get();
        if (docSnap.exists) {
          console.log(`✅ Read successful from ${collectionName}!`);
          console.log(`   Data:`, JSON.stringify(docSnap.data(), null, 2));
        }
        
        // Cleanup
        await testRef.delete();
        console.log(`✅ Test document deleted from ${collectionName}`);
        
        console.log(`\n✅ SUCCESS! Collection ${collectionName} is accessible!`);
        console.log(`\n💡 Use this collection name in your code: ${collectionName}`);
        break; // Stop after first successful collection
        
      } catch (error) {
        if (error.code === 5) {
          console.log(`⚠️ ${collectionName}: NOT_FOUND (collection might not exist yet, will be created on first write)`);
        } else if (error.code === 7) {
          console.log(`❌ ${collectionName}: PERMISSION_DENIED`);
        } else {
          console.log(`❌ ${collectionName}: ${error.message} (code: ${error.code})`);
        }
      }
    }
    
    // Also try to list all collections
    console.log('\n📋 Listing all collections...');
    try {
      const allCollections = await db.listCollections();
      console.log(`✅ Found ${allCollections.length} collection(s):`);
      allCollections.forEach(col => {
        console.log(`   - ${col.id}`);
      });
    } catch (listError) {
      if (listError.code === 5) {
        console.log('⚠️ Cannot list collections (database might be initializing)');
      } else {
        console.log(`❌ Error listing collections: ${listError.message}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('   Code:', error.code);
  }
}

testWithLocation();

