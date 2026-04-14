const pool = require('./src/db');
const bcrypt = require('bcryptjs');

async function createDemoUser() {
  const username = 'temp';
  const password = 'temp';
  const hash = await bcrypt.hash(password, 10);
  // Try to insert, ignore if already exists
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    console.log('Demo user created: temp/temp');
  } catch (e) {
    console.log('Demo user already exists.');
  }
}

createDemoUser();
