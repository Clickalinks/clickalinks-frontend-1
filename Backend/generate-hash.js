import bcrypt from 'bcryptjs';

const password = 'SoomB44t33Dee@';
const hash = bcrypt.hashSync(password, 10);

console.log('\n========================================');
console.log('✅ Password hash generated!');
console.log('========================================');
console.log('\nCopy this ENTIRE string:\n');
console.log(hash);
console.log('\n========================================');
console.log('📋 Next steps:');
console.log('1. Copy the hash above (starts with $2b$10$)');
console.log('2. Go to Render Dashboard → Your service → Environment');
console.log('3. Find ADMIN_PASSWORD_HASH');
console.log('4. Paste the hash and save');
console.log('5. Restart service');
console.log('========================================\n');

