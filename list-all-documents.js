/**
 * List all documents in purchasedSquares collection
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

async function listDocuments() {
  console.log('🔍 Listing all documents in purchasedSquares collection...\n');
  
  try {
    const snapshot = await db.collection('purchasedSquares').get();
    
    if (snapshot.empty) {
      console.log('⚠️ Collection is empty - no documents found');
      console.log('\n💡 This means:');
      console.log('   1. No purchases have been saved yet');
      console.log('   2. OR Firestore rules are blocking reads');
      console.log('   3. OR documents were created but then deleted');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} document(s):\n`);
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      console.log(`📄 Document ID: ${docSnap.id}`);
      console.log(`   Fields: ${Object.keys(data).length}`);
      
      if (Object.keys(data).length === 0) {
        console.log('   ⚠️ WARNING: Document has NO DATA!');
      } else {
        console.log(`   Business: ${data.businessName || 'N/A'}`);
        console.log(`   Square: ${data.squareNumber || 'N/A'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Has Logo: ${data.logoData ? 'Yes' : 'No'}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 5) {
      console.log('\n💡 NOT_FOUND error usually means:');
      console.log('   1. Collection doesn\'t exist yet (normal for new projects)');
      console.log('   2. OR service account doesn\'t have read permissions');
    }
  }
}

listDocuments();

