/**
 * Quick script to generate bcrypt password hash
 * Run with: node generate-password-hash.js
 */

const bcrypt = require('bcryptjs');

// ⚠️ IMPORTANT: Replace 'YOUR_PASSWORD_HERE' below with your actual admin password
// Example: const password = 'SoomB44t33Dee@';
const password = 'SoomB44t33Dee@';

// Generate hash with 10 salt rounds (secure and standard)
const hash = bcrypt.hashSync(password, 10);

console.log('\n========================================');
console.log('✅ Password hash generated!');
console.log('========================================');
console.log('\nCopy this ENTIRE string (starts with $2b$10$):\n');
console.log(hash);
console.log('\n========================================');
console.log('📋 Steps to set in Render:');
console.log('1. Go to Render Dashboard');
console.log('2. Your backend service → Environment tab');
console.log('3. Find ADMIN_PASSWORD_HASH');
console.log('4. Click to edit');
console.log('5. Paste the hash above (the entire $2b$10$... string)');
console.log('   - NO quotes, NO spaces');
console.log('   - Should be exactly 60 characters');
console.log('   - Starts with: $2b$10$');
console.log('6. Save changes');
console.log('7. Wait for automatic redeployment (or manually redeploy)');
console.log('========================================\n');
console.log('⚠️  NOTE: bcryptjs generates $2b$10$ hashes (not $2a$10$)');
console.log('    This is correct and both formats work with bcrypt.compare()\n');

