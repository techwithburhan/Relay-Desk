// Usage: node utils/hashPassword.js myPlainTextPassword
import bcrypt from 'bcryptjs';

const plain = process.argv[2];

if (!plain) {
  console.error('Usage: node utils/hashPassword.js <plainTextPassword>');
  process.exit(1);
}

const hash = bcrypt.hashSync(plain, 10);
console.log('\nBcrypt hash:\n');
console.log(hash);
console.log('\nCopy this into an UPDATE statement, e.g.:');
console.log(`UPDATE agents SET password_hash='${hash}' WHERE email='priya.menon@relaydesk.com';\n`);
