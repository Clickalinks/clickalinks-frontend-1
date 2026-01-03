/**
 * Script to create 220 free promo codes
 * Each code will be unique but share a base name
 * 
 * Usage:
 *   node Backend/scripts/createFreePromoCodes.js
 * 
 * Or with custom base name:
 *   node Backend/scripts/createFreePromoCodes.js FREE
 */

import dotenv from 'dotenv';
dotenv.config();

import { bulkCreatePromoCodes } from '../services/promoCodeService.js';

const BASE_CODE_NAME = process.argv[2] || 'FREE';
const COUNT = 220;

async function createFreePromoCodes() {
  console.log(`🎁 Creating ${COUNT} free promo codes with base name: "${BASE_CODE_NAME}"\n`);
  
  try {
    const result = await bulkCreatePromoCodes({
      code: BASE_CODE_NAME,
      count: COUNT,
      discountType: 'free',  // 100% discount (free)
      discountValue: 100,    // Not used for 'free' type, but required
      maxUses: 1,            // Each code can only be used once
      useSameCodeName: false, // Generate unique codes (FREE-001, FREE-002, etc.)
      description: 'Free ad placement promo code',
      expiresAt: null        // No expiration
    });
    
    if (result.success) {
      console.log(`✅ Successfully created ${result.created} promo codes!`);
      console.log(`❌ Errors: ${result.errors}`);
      
      if (result.codes && result.codes.length > 0) {
        console.log(`\n📋 Sample codes created:`);
        console.log(`   ${result.codes.slice(0, 5).map(c => c.code).join(', ')}`);
        console.log(`   ... and ${result.codes.length - 5} more`);
        
        console.log(`\n📝 All ${result.codes.length} codes:`);
        result.codes.forEach((c, i) => {
          console.log(`   ${i + 1}. ${c.code}`);
        });
      }
      
      if (result.errorDetails && result.errorDetails.length > 0) {
        console.log(`\n⚠️ Errors encountered:`);
        result.errorDetails.forEach(err => {
          console.log(`   Index ${err.index}: ${err.error}`);
        });
      }
      
      console.log(`\n✅ Done! All codes are ready to use.`);
      console.log(`💡 Each code can be used once for a free ad placement.`);
      
      process.exit(0);
    } else {
      console.error(`❌ Failed to create promo codes: ${result.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

createFreePromoCodes();

