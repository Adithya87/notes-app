import { openDb } from './src/db.js';
import bcrypt from 'bcryptjs';

async function createDemoUser() {
  const db = await openDb();
  const username = 'temp';
  const password = 'temp';
  const hash = await bcrypt.hash(password, 10);
  // Try to insert, ignore if already exists
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    console.log('Demo user created: temp/temp');
  } catch (e) {
    console.log('Demo user already exists.');
  }
  await db.close();
}

createDemoUser();
