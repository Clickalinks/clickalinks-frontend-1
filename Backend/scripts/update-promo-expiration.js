/**
 * Script to update promo code expiration date
 * Usage: node scripts/update-promo-expiration.js <promoId> <expirationDate>
 * Example: node scripts/update-promo-expiration.js F58JmY8yhs7fcogYpS0Q "2026-12-31"
 */

import admin from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const db = admin.firestore();

async function updatePromoExpiration(promoId, expirationDate) {
  try {
    console.log(`🔄 Updating promo code expiration: ${promoId}`);
    
    const promoRef = db.collection('promoCodes').doc(promoId);
    const promoDoc = await promoRef.get();
    
    if (!promoDoc.exists) {
      console.error(`❌ Promo code not found: ${promoId}`);
      process.exit(1);
    }
    
    const promoData = promoDoc.data();
    console.log(`📋 Current promo code: ${promoData.code}`);
    console.log(`📋 Current expiration: ${promoData.expiresAt || 'null'}`);
    
    // Parse expiration date
    const expiresAt = new Date(expirationDate);
    if (isNaN(expiresAt.getTime())) {
      console.error(`❌ Invalid date format: ${expirationDate}`);
      console.log(`💡 Use format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss`);
      process.exit(1);
    }
    
    // Update expiration
    await promoRef.update({
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
    });
    
    console.log(`✅ Successfully updated expiration to: ${expiresAt.toISOString()}`);
    console.log(`📅 Expiration date: ${expiresAt.toLocaleDateString()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating promo expiration:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/update-promo-expiration.js <promoId> <expirationDate>');
  console.log('Example: node scripts/update-promo-expiration.js F58JmY8yhs7fcogYpS0Q "2026-12-31"');
  process.exit(1);
}

const [promoId, expirationDate] = args;
updatePromoExpiration(promoId, expirationDate);

