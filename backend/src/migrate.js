import dotenv from 'dotenv';
dotenv.config();
import pool from './db.js';

async function migrate() {
  // Drop tables if they exist (for a fresh start)
  await pool.query(`
    DROP TABLE IF EXISTS notes CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  // Recreate tables
  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE notes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Migration complete.');
}

migrate();
