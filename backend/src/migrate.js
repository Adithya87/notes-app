import dotenv from 'dotenv';
dotenv.config();
import pool from './db.js';

async function migrate() {
  // Drop tables if they exist (for a fresh start)
  await pool.query(`
    DROP TABLE IF EXISTS note_tags CASCADE;
    DROP TABLE IF EXISTS note_versions CASCADE;
    DROP TABLE IF EXISTS tags CASCADE;
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
    CREATE TABLE note_versions (
      id SERIAL PRIMARY KEY,
      note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE tags (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
    CREATE TABLE note_tags (
      note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );
  `);
  console.log('Migration complete.');
}

migrate();
