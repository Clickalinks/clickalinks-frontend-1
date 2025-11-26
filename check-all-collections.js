/**
 * Check ALL collections and documents in Firestore
 * This will help us see what's actually saved
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

async function checkAllCollections() {
  console.log('🔍 Checking ALL collections in Firestore...\n');
  
  try {
    // List all collections
    const collections = await db.listCollections();
    
    if (collections.length === 0) {
      console.log('⚠️ No collections found in Firestore');
      console.log('\n💡 This means:');
      console.log('   1. No purchases have been saved yet');
      console.log('   2. OR Firestore rules are blocking reads');
      console.log('   3. OR the database needs to be initialized');
      return;
    }
    
    console.log(`✅ Found ${collections.length} collection(s):\n`);
    
    for (const col of collections) {
      console.log(`📁 Collection: ${col.id}`);
      
      try {
        const snapshot = await col.get();
        
        if (snapshot.empty) {
          console.log(`   ⚠️ Empty collection (no documents)`);
        } else {
          console.log(`   📄 Documents: ${snapshot.size}`);
          
          // Show first 5 documents
          let count = 0;
          snapshot.forEach((docSnap) => {
            if (count < 5) {
              const data = docSnap.data();
              console.log(`\n   Document ID: ${docSnap.id}`);
              console.log(`   Fields: ${Object.keys(data).length}`);
              
              if (Object.keys(data).length === 0) {
                console.log(`   ⚠️ WARNING: Document has NO DATA!`);
              } else {
                console.log(`   Keys: ${Object.keys(data).slice(0, 10).join(', ')}${Object.keys(data).length > 10 ? '...' : ''}`);
                console.log(`   Status: ${data.status || 'N/A'}`);
                console.log(`   Payment: ${data.paymentStatus || 'N/A'}`);
                console.log(`   Square: ${data.squareNumber || 'N/A'}`);
                console.log(`   Business: ${data.businessName || 'N/A'}`);
                console.log(`   Has Logo: ${data.logoData ? 'Yes' : 'No'}`);
                console.log(`   OrderingIndex: ${data.orderingIndex !== undefined ? data.orderingIndex : 'Not set'}`);
              }
              count++;
            }
          });
          
          if (snapshot.size > 5) {
            console.log(`\n   ... and ${snapshot.size - 5} more document(s)`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error reading collection: ${error.message}`);
      }
      
      console.log('\n');
    }
    
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

checkAllCollections();

