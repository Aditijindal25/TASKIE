const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// All routes require auth
router.use(authenticate);

// GET /api/tasks — get all tasks for logged-in user
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tasks — create a new task
router.post('/', async (req, res) => {
  const { name, tag = 'fe', priority = 'med', due_date } = req.body;
  if (!name) return res.status(400).json({ error: 'Task name is required' });

  try {
    const { rows } = await db.query(
      'INSERT INTO tasks (user_id, name, tag, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, name, tag, priority, due_date || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
  const { name, done, tag, priority, due_date } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE tasks
       SET name = COALESCE($1, name),
           done = COALESCE($2, done),
           tag = COALESCE($3, tag),
           priority = COALESCE($4, priority),
           due_date = COALESCE($5, due_date)
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, done, tag, priority, due_date, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted', id: rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
