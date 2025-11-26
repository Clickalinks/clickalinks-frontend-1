/**
 * Test both collection name variations to see which one works
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

async function testBothCollections() {
  console.log('🔍 Testing both collection name variations...\n');
  
  const collections = ['purchasedsquares', 'purchasedSquares'];
  let workingCollection = null;
  
  for (const collectionName of collections) {
    console.log(`📁 Testing: ${collectionName}`);
    
    try {
      // Try to write
      const testRef = db.collection(collectionName).doc('test-backend');
      await testRef.set({
        test: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        collection: collectionName
      });
      console.log(`   ✅ Write successful!`);
      
      // Try to read
      const docSnap = await testRef.get();
      if (docSnap.exists) {
        console.log(`   ✅ Read successful!`);
        workingCollection = collectionName;
      }
      
      // Cleanup
      await testRef.delete();
      console.log(`   ✅ Test document deleted\n`);
      
    } catch (error) {
      if (error.code === 5) {
        console.log(`   ⚠️ NOT_FOUND - collection doesn't exist yet (will be created on first write)`);
      } else {
        console.log(`   ❌ Error: ${error.message} (code: ${error.code})\n`);
      }
    }
  }
  
  // Try to list all collections
  console.log('📋 Listing all collections in database...');
  try {
    const allCollections = await db.listCollections();
    console.log(`✅ Found ${allCollections.length} collection(s):`);
    allCollections.forEach(col => {
      console.log(`   - ${col.id}`);
    });
    
    if (allCollections.length > 0) {
      console.log(`\n💡 Actual collection name(s) in Firestore:`);
      allCollections.forEach(col => {
        console.log(`   → Use: '${col.id}' in your code`);
      });
    }
  } catch (listError) {
    if (listError.code === 5) {
      console.log('⚠️ Cannot list collections (database might be initializing)');
    } else {
      console.log(`❌ Error: ${listError.message}`);
    }
  }
  
  if (workingCollection) {
    console.log(`\n✅ SUCCESS! Use collection name: '${workingCollection}'`);
    console.log(`\n💡 Update your code to use: collection(db, '${workingCollection}')`);
  } else {
    console.log(`\n⚠️ Neither collection exists yet.`);
    console.log(`   The collection will be created automatically when you save your first purchase.`);
    console.log(`   Use: 'purchasedSquares' (camelCase) - this is the standard convention.`);
  }
}

testBothCollections();

