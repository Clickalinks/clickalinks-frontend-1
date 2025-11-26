/**
 * Test writing and reading from Firestore
 * This will help diagnose permission issues
 */

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
}

const db = admin.firestore();

async function testWriteRead() {
  console.log('🧪 Testing Firestore write and read permissions...\n');
  
  const testDocId = `test-${Date.now()}`;
  const testCollection = 'purchasedSquares';
  
  try {
    // Test 1: Try to write a test document
    console.log('Test 1: Writing test document...');
    const testRef = db.collection(testCollection).doc(testDocId);
    await testRef.set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Backend test document'
    });
    console.log(`✅ Write successful! Document ID: ${testDocId}\n`);
    
    // Test 2: Try to read it back
    console.log('Test 2: Reading test document back...');
    const docSnap = await testRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log(`✅ Read successful!`);
      console.log(`   Document data:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`⚠️ Document doesn't exist after write`);
    }
    
    // Test 3: Try to query the collection
    console.log('\nTest 3: Querying collection...');
    const snapshot = await db.collection(testCollection)
      .where('test', '==', true)
      .limit(5)
      .get();
    
    console.log(`✅ Query successful! Found ${snapshot.size} document(s)`);
    
    // Test 4: List all documents
    console.log('\nTest 4: Listing all documents in collection...');
    const allSnapshot = await db.collection(testCollection).limit(10).get();
    console.log(`✅ Found ${allSnapshot.size} total document(s) in collection`);
    
    if (allSnapshot.size > 0) {
      console.log('\n📋 Documents:');
      allSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(`\n   ID: ${docSnap.id}`);
        console.log(`   Fields: ${Object.keys(data).length}`);
        if (data.businessName) {
          console.log(`   Business: ${data.businessName}`);
        }
        if (data.squareNumber) {
          console.log(`   Square: ${data.squareNumber}`);
        }
        if (data.orderingIndex !== undefined) {
          console.log(`   OrderingIndex: ${data.orderingIndex}`);
        }
      });
    }
    
    // Cleanup: Delete test document
    console.log('\n🧹 Cleaning up test document...');
    await testRef.delete();
    console.log('✅ Test document deleted');
    
    console.log('\n✅ All tests passed! Backend has read/write access.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    
    if (error.code === 5) {
      console.log('\n💡 NOT_FOUND error means:');
      console.log('   1. Collection doesn\'t exist (will be created on first write)');
      console.log('   2. OR service account doesn\'t have permissions');
      console.log('   3. OR database region mismatch');
    } else if (error.code === 7) {
      console.log('\n💡 PERMISSION_DENIED error means:');
      console.log('   1. Service account doesn\'t have write permissions');
      console.log('   2. OR Firestore rules are blocking writes');
    }
    
    process.exit(1);
  }
}

testWriteRead();

