import pool from './src/db.js';

async function printUsers() {
  const result = await pool.query('SELECT id, username FROM users');
  console.log('Users:', result.rows);
  process.exit(0);
}

printUsers().catch(e => { console.error(e); process.exit(1); });
