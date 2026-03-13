#!/usr/bin/env node

/**
 * Utility to create or reset admin user credentials.
 * Usage: node create-admin.js <email> <password>
 * Outputs SQL INSERT statement with bcrypt-hashed password.
 *
 * Requires: npm install bcrypt (in the server/ directory)
 * Or run from server/: node ../database/create-admin.js admin@pricewise.ng mypassword
 */

import bcrypt from 'bcrypt';

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

console.log(`-- Run this SQL to create/update admin user:`);
console.log(`INSERT INTO admin_users (email, password_hash) VALUES ('${email}', '${hash}')`);
console.log(`ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`);
console.log(`\n-- Bcrypt hash: ${hash}`);
