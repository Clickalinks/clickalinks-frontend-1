/**
 * Script to manually save Envato Elements purchase from Stripe session
 * This will fetch the purchase data from Stripe and save it to Firestore
 * Usage: node scripts/save-envato-purchase.js <sessionId>
 * Example: node scripts/save-envato-purchase.js cs_live_a1cnz6wHHW0u0UbAh6K3XpmqWIBhNCgij4zPEExYu9Weo51lbU1GMCbN1T
 */

import Stripe from 'stripe';
import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';
import { sendAdminNotificationEmail, sendAdConfirmationEmail } from '../services/emailService.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const db = admin.firestore();

async function saveEnvatoPurchase(sessionId) {
  try {
    console.log(`🔍 Fetching Stripe session: ${sessionId}`);
    
    // Fetch session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('✅ Stripe session retrieved:');
    console.log(`   Payment Status: ${session.payment_status}`);
    console.log(`   Amount: £${(session.amount_total / 100).toFixed(2)}`);
    console.log(`   Customer Email: ${session.customer_email || 'N/A'}`);
    console.log(`   Metadata:`, session.metadata);
    
    if (session.payment_status !== 'paid') {
      console.error(`❌ Payment not completed. Status: ${session.payment_status}`);
      process.exit(1);
    }
    
    const metadata = session.metadata || {};
    const squareNumber = parseInt(metadata.squareNumber);
    const businessName = metadata.businessName || 'Envato Elements';
    const contactEmail = session.customer_email || metadata.contactEmail;
    const duration = parseInt(metadata.duration) || 10;
    const pageNumber = parseInt(metadata.pageNumber) || 1;
    const website = metadata.website || 'https://elements.envato.com/all-items/sales';
    
    if (!squareNumber || !contactEmail) {
      console.error('❌ Missing required data from Stripe session:');
      console.error(`   Square Number: ${squareNumber || 'MISSING'}`);
      console.error(`   Contact Email: ${contactEmail || 'MISSING'}`);
      process.exit(1);
    }
    
    console.log(`\n📦 Purchase Details:`);
    console.log(`   Square Number: ${squareNumber}`);
    console.log(`   Business Name: ${businessName}`);
    console.log(`   Contact Email: ${contactEmail}`);
    console.log(`   Duration: ${duration} days`);
    console.log(`   Website: ${website}`);
    
    // Check if purchase already exists
    const existingQuery = await db.collection('purchasedSquares')
      .where('transactionId', '==', sessionId)
      .get();
    
    if (!existingQuery.empty) {
      console.log(`\n⚠️ Purchase already exists in Firestore!`);
      const existingDoc = existingQuery.docs[0];
      const existingData = existingDoc.data();
      console.log(`   Purchase ID: ${existingDoc.id}`);
      console.log(`   Status: ${existingData.status}`);
      console.log(`   Payment Status: ${existingData.paymentStatus}`);
      console.log(`   Emails Sent: ${existingData.emailsSent || false}`);
      
      // Check if emails were sent
      if (!existingData.emailsSent) {
        console.log(`\n📧 Emails not sent yet. Sending emails now...`);
        
        const startDate = existingData.startDate?.toDate() || new Date();
        const endDate = existingData.endDate?.toDate() || new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
        const amount = existingData.amount || existingData.finalAmount || (session.amount_total / 100);
        
        // Send admin notification
        await sendAdminNotificationEmail('purchase', {
          businessName: existingData.businessName,
          contactEmail: existingData.contactEmail,
          squareNumber: existingData.squareNumber,
          pageNumber: existingData.pageNumber || 1,
          duration: existingData.duration || duration,
          amount: amount,
          transactionId: sessionId,
          finalAmount: amount,
          originalAmount: amount,
          discountAmount: 0,
          selectedDuration: existingData.duration || duration,
          purchaseId: existingDoc.id
        }).catch(err => console.error('❌ Admin email error:', err.message));
        
        // Send customer emails
        if (existingData.contactEmail) {
          await sendAdConfirmationEmail({
            businessName: existingData.businessName,
            contactEmail: existingData.contactEmail,
            squareNumber: existingData.squareNumber,
            pageNumber: existingData.pageNumber || 1,
            duration: existingData.duration || duration,
            selectedDuration: existingData.duration || duration,
            finalAmount: amount,
            originalAmount: amount,
            discountAmount: 0,
            transactionId: sessionId,
            website: existingData.website || existingData.dealLink || website
          }).catch(err => console.error('❌ Customer email error:', err.message));
        }
        
        // Update emailsSent flag
        await existingDoc.ref.update({ emailsSent: true });
        console.log(`✅ Emails sent and flag updated!`);
      } else {
        console.log(`\n✅ Emails were already sent for this purchase.`);
      }
      
      process.exit(0);
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    const amount = session.amount_total / 100;
    
    // Generate purchase ID
    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Create purchase document
    const purchaseData = {
      purchaseId,
      squareNumber,
      pageNumber,
      businessName: businessName.trim(),
      contactEmail: contactEmail.trim(),
      website: website.trim(),
      dealLink: website.trim(),
      amount,
      originalAmount: amount,
      finalAmount: amount,
      discountAmount: 0,
      duration,
      status: 'active',
      paymentStatus: 'paid',
      transactionId: sessionId,
      promoCode: null,
      promoId: null,
      emailsSent: false,
      startDate: admin.firestore.Timestamp.fromDate(startDate),
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      purchaseDate: admin.firestore.Timestamp.fromDate(startDate),
      clickCount: 0,
      lastClickAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log(`\n💾 Saving purchase to Firestore...`);
    const purchaseRef = db.collection('purchasedSquares').doc(purchaseId);
    await purchaseRef.set(purchaseData);
    
    console.log(`✅ Purchase saved! Purchase ID: ${purchaseId}`);
    
    // Send emails
    console.log(`\n📧 Sending emails...`);
    
    // Send admin notification
    await sendAdminNotificationEmail('purchase', {
      businessName: businessName.trim(),
      contactEmail: contactEmail.trim(),
      squareNumber,
      pageNumber,
      duration,
      amount,
      transactionId: sessionId,
      finalAmount: amount,
      originalAmount: amount,
      discountAmount: 0,
      selectedDuration: duration,
      purchaseId
    }).catch(err => console.error('❌ Admin email error:', err.message));
    
    // Send customer emails
    await sendAdConfirmationEmail({
      businessName: businessName.trim(),
      contactEmail: contactEmail.trim(),
      squareNumber,
      pageNumber,
      duration,
      selectedDuration: duration,
      finalAmount: amount,
      originalAmount: amount,
      discountAmount: 0,
      transactionId: sessionId,
      website
    }).catch(err => console.error('❌ Customer email error:', err.message));
    
    // Update emailsSent flag
    await purchaseRef.update({ emailsSent: true });
    
    console.log(`\n✅ All done! Purchase saved and emails sent.`);
    console.log(`\n📋 Summary:`);
    console.log(`   Purchase ID: ${purchaseId}`);
    console.log(`   Square: ${squareNumber}`);
    console.log(`   Business: ${businessName}`);
    console.log(`   Email: ${contactEmail}`);
    console.log(`   Duration: ${duration} days`);
    console.log(`   Amount: £${amount.toFixed(2)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error saving purchase:', error);
    if (error.type === 'StripeInvalidRequestError') {
      console.error(`   Stripe Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Get session ID from command line
const sessionId = process.argv[2];

if (!sessionId) {
  console.log('Usage: node scripts/save-envato-purchase.js <sessionId>');
  console.log('Example: node scripts/save-envato-purchase.js cs_live_a1cnz6wHHW0u0UbAh6K3XpmqWIBhNCgij4zPEExYu9Weo51lbU1GMCbN1T');
  process.exit(1);
}

saveEnvatoPurchase(sessionId);

