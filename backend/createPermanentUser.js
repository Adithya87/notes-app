import bcrypt from 'bcryptjs';
import pool from './src/db.js';

async function createPermanentUser() {
  const username = 'temp';
  const password = '12345678';
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`,
    [username, hash]
  );
  console.log('Permanent user created (or already exists):', username);
  process.exit(0);
}

createPermanentUser().catch(e => { console.error(e); process.exit(1); });
