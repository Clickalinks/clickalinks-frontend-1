/**
 * Check a specific Firestore document to see what data it has
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

async function checkDocument() {
  const documentId = process.argv[2] || 'paZtFqrcKcmtzKHDjKS5';
  
  console.log(`🔍 Checking document: ${documentId}\n`);
  
  try {
    const docRef = db.collection('purchasedSquares').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      console.log('❌ Document does not exist');
      return;
    }
    
    const data = docSnap.data();
    console.log('📄 Document exists!');
    console.log(`   Fields: ${Object.keys(data).length}`);
    console.log(`   Data:`, JSON.stringify(data, null, 2));
    
    if (Object.keys(data).length === 0) {
      console.log('\n⚠️ Document exists but has NO DATA!');
      console.log('   This usually means:');
      console.log('   1. Firestore rules blocked the write');
      console.log('   2. The document was created but data write failed');
      console.log('   3. The document was deleted but still shows in UI');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Code:', error.code);
  }
}

checkDocument();

