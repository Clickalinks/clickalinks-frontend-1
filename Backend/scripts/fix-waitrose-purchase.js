/**
 * Script to fix Waitrose UK purchase: correct amount and ensure emails are sent
 * Usage: node scripts/fix-waitrose-purchase.js
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';

dotenv.config();

const db = admin.firestore();
const TRANSACTION_ID = 'cs_live_a1CShNhjQpxifbaZLPSPu5p8rTaMLq71YQdpe3K1ZCMGFASmxB8SKmW0u4';

async function fixWaitrosePurchase() {
  try {
    console.log(`🔍 Finding purchase with transaction ID: ${TRANSACTION_ID}`);
    
    // Find purchase by transactionId
    const purchaseQuery = await db.collection('purchasedSquares')
      .where('transactionId', '==', TRANSACTION_ID)
      .get();
    
    if (purchaseQuery.empty) {
      console.error('❌ Purchase not found with transaction ID:', TRANSACTION_ID);
      process.exit(1);
    }
    
    const purchaseDoc = purchaseQuery.docs[0];
    const purchaseData = purchaseDoc.data();
    
    console.log(`\n📋 Current Purchase Data:`);
    console.log(`   Purchase ID: ${purchaseDoc.id}`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Current Amount: ${purchaseData.amount}`);
    console.log(`   Current Final Amount: ${purchaseData.finalAmount}`);
    console.log(`   Emails Sent: ${purchaseData.emailsSent || false}`);
    
    // The correct amount from Stripe is £10.00
    const correctAmount = 10.0;
    
    // Update purchase with correct amount
    console.log(`\n💾 Updating purchase with correct amount: £${correctAmount.toFixed(2)}`);
    await purchaseDoc.ref.update({
      amount: correctAmount,
      finalAmount: correctAmount,
      originalAmount: correctAmount,
      discountAmount: 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Purchase updated with correct amount!`);
    
    // Send emails if not already sent
    if (!purchaseData.emailsSent) {
      console.log(`\n📧 Sending emails...`);
      
      // Send admin notification
      await sendAdminNotificationEmail('purchase', {
        businessName: purchaseData.businessName,
        contactEmail: purchaseData.contactEmail,
        squareNumber: purchaseData.squareNumber,
        pageNumber: purchaseData.pageNumber || 1,
        duration: purchaseData.duration || 10,
        amount: correctAmount,
        transactionId: TRANSACTION_ID,
        finalAmount: correctAmount,
        originalAmount: correctAmount,
        discountAmount: 0,
        selectedDuration: purchaseData.duration || 10,
        purchaseId: purchaseDoc.id
      }).catch(err => console.error('❌ Admin email error:', err.message));
      
      // Send customer emails
      if (purchaseData.contactEmail) {
        await sendAdConfirmationEmail({
          businessName: purchaseData.businessName,
          contactEmail: purchaseData.contactEmail,
          squareNumber: purchaseData.squareNumber,
          pageNumber: purchaseData.pageNumber || 1,
          duration: purchaseData.duration || 10,
          selectedDuration: purchaseData.duration || 10,
          finalAmount: correctAmount,
          originalAmount: correctAmount,
          discountAmount: 0,
          transactionId: TRANSACTION_ID,
          website: purchaseData.website || purchaseData.dealLink || ''
        }).catch(err => console.error('❌ Customer email error:', err.message));
      }
      
      // Mark emails as sent
      await purchaseDoc.ref.update({ emailsSent: true });
      console.log(`✅ Emails sent!`);
    } else {
      console.log(`\n✅ Emails were already sent for this purchase.`);
    }
    
    console.log(`\n✅ All done! Purchase fixed and emails sent.`);
    console.log(`\n📋 Summary:`);
    console.log(`   Purchase ID: ${purchaseDoc.id}`);
    console.log(`   Square: ${purchaseData.squareNumber}`);
    console.log(`   Business: ${purchaseData.businessName}`);
    console.log(`   Amount: £${correctAmount.toFixed(2)}`);
    console.log(`   Email: ${purchaseData.contactEmail}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing purchase:', error);
    process.exit(1);
  }
}

fixWaitrosePurchase();

