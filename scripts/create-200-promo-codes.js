/**
 * Script to create 200 promo codes for 10 free days campaign
 * Run: node Backend/scripts/create-200-promo-codes.js
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.error('❌ ADMIN_API_KEY is not set. Cannot create promo codes.');
  process.exit(1);
}

async function create200PromoCodes() {
  console.log('🎫 Creating 200 promo codes for 10 free days campaign...\n');

  try {
    const response = await fetch(`${BACKEND_URL}/api/promo-code/bulk-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ADMIN_API_KEY
      },
      body: JSON.stringify({
        count: 200,
        prefix: 'FREE10',
        discountType: 'free_days',
        discountValue: 10, // 10 free days
        description: '10 Free Days - Launch Campaign',
        maxUses: 1, // Each code can only be used once
        expiryDate: null, // No expiry (or set a date like '2026-12-31')
        startDate: null // Active immediately
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ Successfully created promo codes!');
      console.log(`   Created: ${result.created} codes`);
      console.log(`   Failed: ${result.failed} codes`);
      console.log(`\n📋 First 10 codes:`);
      
      result.codes.slice(0, 10).forEach((code, index) => {
        console.log(`   ${index + 1}. ${code.code}`);
      });

      if (result.codes.length > 10) {
        console.log(`   ... and ${result.codes.length - 10} more`);
      }

      console.log(`\n💾 Save these codes to a file for distribution:`);
      console.log(`   All codes: ${result.codes.map(c => c.code).join(', ')}`);
      
      // Save to file
      const fs = await import('fs');
      const codesList = result.codes.map(c => c.code).join('\n');
      fs.writeFileSync('promo-codes-200.txt', codesList);
      console.log(`\n✅ Codes saved to: promo-codes-200.txt`);

    } else {
      console.error('❌ Failed to create promo codes:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error creating promo codes:', error.message);
    process.exit(1);
  }
}

create200PromoCodes();

