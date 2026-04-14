// ...existing code...
// Danger: Remove all users (admin/maintenance only)
app.delete('/api/admin/remove-all-users', async (req, res) => {
  try {
    await pool.query('DELETE FROM users');
    res.json({ success: true, message: 'All users removed.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove users.' });
  }
});
// Ensure demo user exists on every start
async function ensureDemoUser() {
  const username = 'temp';
  const password = '12345678';
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    console.log('Demo user created');
  } catch (e) {
    // Ignore if already exists
  }
}
ensureDemoUser();
// Run migrations on every start

import './migrate.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { marked } from 'marked';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


// User registration
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
    res.json({ success: true });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(400).json({ error: 'Username taken' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// CRUD for notes (protected)
app.get('/api/notes', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [req.user.id]);
  res.json(result.rows);
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' });
  const insertResult = await pool.query(
    'INSERT INTO notes (user_id, title, body) VALUES ($1, $2, $3) RETURNING *',
    [req.user.id, title, body]
  );
  res.json(insertResult.rows[0]);
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, body } = req.body;
  await pool.query(
    'UPDATE notes SET title = $1, body = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
    [title, body, req.params.id, req.user.id]
  );
  const noteResult = await pool.query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  res.json(noteResult.rows[0]);
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// Markdown preview endpoint (optional)
app.post('/api/preview', (req, res) => {
  const { markdown } = req.body;
  if (typeof markdown !== 'string') return res.status(400).json({ error: 'Invalid markdown' });
  const html = marked.parse(markdown);
  res.json({ html });
});

// Search notes
app.get('/api/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  const result = await pool.query(
    'SELECT * FROM notes WHERE user_id = $1 AND (title ILIKE $2 OR body ILIKE $2)',
    [req.user.id, `%${q}%`]
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
