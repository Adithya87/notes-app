// Ensure demo user exists on every start
async function ensureDemoUser() {
  const db = await openDb();
  const username = 'temp';
  const password = 'temp';
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    console.log('Demo user created');
  } catch (e) {
    // Ignore if already exists
  }
  await db.close();
}
ensureDemoUser();
// Run migrations on every start
import './migrate.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openDb } from './db.js';
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
  const db = await openDb();
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ success: true });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(400).json({ error: 'Username taken' });
  } finally {
    await db.close();
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  await db.close();
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

// CRUD for notes (protected)
app.get('/api/notes', authenticateToken, async (req, res) => {
  const db = await openDb();
  const notes = await db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
  await db.close();
  res.json(notes);
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' });
  const db = await openDb();
  const result = await db.run('INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)', [req.user.id, title, body]);
  const note = await db.get('SELECT * FROM notes WHERE id = ?', [result.lastID]);
  await db.close();
  res.json(note);
});


// Update note (no versioning)
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, body } = req.body;
  const db = await openDb();
  await db.run('UPDATE notes SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [title, body, req.params.id, req.user.id]);
  const note = await db.get('SELECT * FROM notes WHERE id = ?', [req.params.id]);
  await db.close();
  res.json(note);
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const db = await openDb();
  await db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  await db.close();
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
  const db = await openDb();
  const notes = await db.all('SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR body LIKE ?)', [req.user.id, `%${q}%`, `%${q}%`]);
  await db.close();
  res.json(notes);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
