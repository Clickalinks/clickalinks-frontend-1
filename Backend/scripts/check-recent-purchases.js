/**
 * Diagnostic script to check recent purchases in Firestore
 * Shows the last 10 purchases with detailed information
 */

import admin from '../config/firebaseAdmin.js';

const checkRecentPurchases = async () => {
  try {
    console.log('🔍 Checking recent purchases in Firestore...\n');
    
    const db = admin.firestore();
    const purchasesRef = db.collection('purchasedSquares');
    
    // Get last 10 purchases ordered by createdAt
    const snapshot = await purchasesRef
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      console.log('❌ No purchases found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} recent purchase(s):\n`);
    console.log('='.repeat(100));
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📦 Purchase #${index + 1}`);
      console.log('-'.repeat(100));
      console.log('   Document ID:', doc.id);
      console.log('   Purchase ID:', data.purchaseId || 'MISSING');
      console.log('   Square Number:', data.squareNumber || 'MISSING');
      console.log('   Page Number:', data.pageNumber || 'MISSING');
      console.log('   Business Name:', data.businessName || 'MISSING');
      console.log('   Contact Email:', data.contactEmail || 'MISSING');
      console.log('   Transaction ID:', data.transactionId || 'MISSING');
      console.log('   Amount:', data.amount ? `£${data.amount}` : 'MISSING');
      console.log('   Duration:', data.duration ? `${data.duration} days` : 'MISSING');
      console.log('   Status:', data.status || 'MISSING');
      console.log('   Payment Status:', data.paymentStatus || 'MISSING');
      console.log('   Has Logo Data:', !!data.logoData);
      console.log('   Logo Data:', data.logoData ? (data.logoData.substring(0, 80) + '...') : 'MISSING');
      console.log('   Has Storage Path:', !!data.storagePath);
      console.log('   Storage Path:', data.storagePath || 'MISSING');
      console.log('   Website:', data.website || data.dealLink || 'none');
      console.log('   Promo Code:', data.promoCode || 'none');
      console.log('   Start Date:', data.startDate?.toDate ? data.startDate.toDate().toISOString() : 'MISSING');
      console.log('   End Date:', data.endDate?.toDate ? data.endDate.toDate().toISOString() : 'MISSING');
      console.log('   Created At:', data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 'MISSING');
      
      // Check for missing critical data
      const issues = [];
      if (!data.contactEmail) issues.push('Missing contactEmail');
      if (!data.businessName) issues.push('Missing businessName');
      if (!data.logoData && !data.storagePath) issues.push('Missing logo data');
      if (!data.transactionId) issues.push('Missing transactionId');
      
      if (issues.length > 0) {
        console.log('   ⚠️  ISSUES:', issues.join(', '));
      }
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ Check complete\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking purchases:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    process.exit(1);
  }
};

checkRecentPurchases();