/**
 * Find ALL purchases in Firestore, not just recent ones
 * Helps diagnose missing purchases
 */

import admin from '../config/firebaseAdmin.js';

const findAllPurchases = async () => {
  try {
    console.log('🔍 Finding ALL purchases in Firestore...\n');
    
    const db = admin.firestore();
    const purchasesRef = db.collection('purchasedSquares');
    
    // Get ALL purchases (no limit)
    const snapshot = await purchasesRef.get();
    
    if (snapshot.empty) {
      console.log('❌ No purchases found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} total purchase(s):\n`);
    console.log('='.repeat(100));
    
    const purchases = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      purchases.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by createdAt (newest first)
    purchases.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    
    purchases.forEach((purchase, index) => {
      const data = purchase;
      console.log(`\n📦 Purchase #${index + 1}`);
      console.log('-'.repeat(100));
      console.log('   Document ID:', purchase.id);
      console.log('   Purchase ID:', data.purchaseId || 'MISSING');
      console.log('   Square Number:', data.squareNumber || 'MISSING');
      console.log('   Page Number:', data.pageNumber || 'MISSING');
      console.log('   Business Name:', data.businessName || 'MISSING');
      console.log('   Contact Email:', data.contactEmail || 'MISSING');
      console.log('   Transaction ID:', data.transactionId || 'MISSING');
      console.log('   Amount:', data.amount ? `£${data.amount}` : 'MISSING');
      console.log('   Original Amount:', data.originalAmount ? `£${data.originalAmount}` : 'not set');
      console.log('   Final Amount:', data.finalAmount ? `£${data.finalAmount}` : 'not set');
      console.log('   Discount Amount:', data.discountAmount ? `£${data.discountAmount}` : 'not set');
      console.log('   Duration:', data.duration ? `${data.duration} days` : 'MISSING');
      console.log('   Status:', data.status || 'MISSING');
      console.log('   Payment Status:', data.paymentStatus || 'MISSING');
      console.log('   Promo Code:', data.promoCode || 'none');
      console.log('   Has Logo Data:', !!data.logoData);
      console.log('   Has Storage Path:', !!data.storagePath);
      console.log('   Start Date:', data.startDate?.toDate ? data.startDate.toDate().toISOString() : 'MISSING');
      console.log('   End Date:', data.endDate?.toDate ? data.endDate.toDate().toISOString() : 'MISSING');
      console.log('   Created At:', data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 'MISSING');
      
      // Check for missing critical data
      const issues = [];
      if (!data.contactEmail) issues.push('Missing contactEmail');
      if (!data.businessName) issues.push('Missing businessName');
      if (!data.logoData && !data.storagePath) issues.push('Missing logo data');
      if (!data.transactionId) issues.push('Missing transactionId');
      if (data.transactionId && data.transactionId.startsWith('free_')) {
        issues.push('Promo code purchase (transaction starts with "free_")');
      }
      if (data.transactionId && !data.transactionId.startsWith('free_') && !data.transactionId.startsWith('cs_')) {
        issues.push('⚠️ Unusual transaction ID format');
      }
      
      if (issues.length > 0) {
        console.log('   ⚠️  NOTES:', issues.join(', '));
      }
    });
    
    console.log('\n' + '='.repeat(100));
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Purchases: ${purchases.length}`);
    console.log(`   Promo Code Purchases: ${purchases.filter(p => p.transactionId?.startsWith('free_')).length}`);
    console.log(`   Stripe Purchases: ${purchases.filter(p => p.transactionId?.startsWith('cs_')).length}`);
    console.log(`   Other Transaction IDs: ${purchases.filter(p => p.transactionId && !p.transactionId.startsWith('free_') && !p.transactionId.startsWith('cs_')).length}`);
    console.log(`   Missing Transaction ID: ${purchases.filter(p => !p.transactionId).length}`);
    console.log('\n✅ Check complete\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking purchases:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    process.exit(1);
  }
};

findAllPurchases();