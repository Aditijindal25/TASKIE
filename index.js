require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// AUTH MIDDLEWARE
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// HEALTH CHECK
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email',
      [name, email, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET TASKS
app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE TASK
app.post('/api/tasks', authenticate, async (req, res) => {
  const { name, tag = 'fe', priority = 'med', due_date } = req.body;
  if (!name) return res.status(400).json({ error: 'Task name required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (user_id,name,tag,priority,due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, name, tag, priority, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE TASK
app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const { name, done, tag, priority, due_date } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET name=COALESCE($1,name), done=COALESCE($2,done), tag=COALESCE($3,tag),
       priority=COALESCE($4,priority), due_date=COALESCE($5,due_date)
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [name, done, tag, priority, due_date, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE TASK
app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Deleted', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
