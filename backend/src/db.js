import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: process.env.DATABASE_URL || './notes.db',
    driver: sqlite3.Database
  });
}
