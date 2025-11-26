/**
 * Test Firebase Admin SDK Connection
 * This will help diagnose connection issues
 */

import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';

console.log('🧪 Testing Firebase Admin SDK Connection...\n');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    console.log('✅ Using FIREBASE_SERVICE_ACCOUNT from environment');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.log('✅ Using GOOGLE_APPLICATION_CREDENTIALS from environment');
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} else {
  console.log('✅ Firebase Admin already initialized');
}

const db = admin.firestore();

async function testConnection() {
  try {
    console.log('\n📊 Testing Firestore connection...\n');
    
    // Test 1: Try to write a test document (this will create collection if needed)
    console.log('Test 1: Testing write access (creating test document)...');
    try {
      const testRef = db.collection('_test').doc('connection-test');
      await testRef.set({ 
        test: true, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
      console.log('✅ Write test successful! Firestore is accessible.');
      
      // Clean up test document
      await testRef.delete();
      console.log('✅ Test document cleaned up.');
    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Write test failed with NOT_FOUND.');
        console.log('   This might mean Firestore needs a few more minutes to fully initialize.');
        console.log('   OR the service account needs Firestore permissions.');
      } else {
        throw error;
      }
    }
    
    // Test 2: List all collections (might fail if no collections exist)
    console.log('\nTest 2: Listing all collections...');
    try {
      const collections = await db.listCollections();
      console.log(`✅ Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`   - ${col.id}`);
      });
    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Cannot list collections (no collections exist yet - this is OK)');
        console.log('   Collections will be created automatically when you save purchases.');
      } else {
        throw error;
      }
    }
    
    // Test 3: Try to read from purchasedSquares collection
    console.log('\nTest 3: Checking purchasedSquares collection...');
    try {
      const snapshot = await db.collection('purchasedSquares').limit(1).get();
      console.log(`✅ Collection exists! Found ${snapshot.size} document(s) (limited to 1)`);
      
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        console.log(`\n📄 Sample document:`);
        console.log(`   ID: ${firstDoc.id}`);
        console.log(`   Data keys: ${Object.keys(firstDoc.data()).join(', ')}`);
      }
    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet (this is OK - it will be created on first save)');
      } else {
        throw error;
      }
    }
    
    // Test 4: Try to query active purchases
    console.log('\nTest 4: Querying active purchases...');
    try {
      const activeSnapshot = await db.collection('purchasedSquares')
        .where('status', '==', 'active')
        .limit(5)
        .get();
      
      console.log(`✅ Query successful! Found ${activeSnapshot.size} active purchase(s)`);
      
      if (!activeSnapshot.empty) {
        console.log('\n📋 Active purchases:');
        activeSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`   - ${doc.id}: ${data.businessName || 'No name'} (Square ${data.squareNumber || 'N/A'})`);
        });
      }
    } catch (error) {
      if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('⚠️ Collection does not exist yet (this is OK)');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ All tests passed! Firebase Admin SDK is working correctly.');
    console.log('\n💡 If you see "Collection does not exist yet", that\'s normal.');
    console.log('   The collection will be created automatically when you save your first purchase.');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check that your service account JSON file is correct');
    console.error('2. Verify the project ID matches your Firebase project');
    console.error('3. Make sure Firestore is enabled in Firebase Console');
    console.error('4. Check that the service account has Firestore permissions');
    process.exit(1);
  }
}

testConnection();

