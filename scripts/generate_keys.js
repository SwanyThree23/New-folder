const crypto = require('crypto');

console.log('--- Swannie3 Key Generator ---');
console.log('');

// 1. Generate 32-byte (256-bit) Hex Key (64 chars) for MASTER_KEY
const masterKey = crypto.randomBytes(32).toString('hex');
console.log('MASTER_KEY (32 bytes, 64 hex chars):');
console.log(masterKey);
console.log('');

// 2. Generate 64-byte (512-bit) Hex Key (128 chars) for JWT/Session Secret
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('SESSION_SECRET (64 bytes, 128 hex chars):');
console.log(sessionSecret);
console.log('');

console.log('--- INSTRUCTIONS ---');
console.log('Copy these values into your .env.production file.');
console.log('Example:');
console.log(`MASTER_KEY=${masterKey}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
