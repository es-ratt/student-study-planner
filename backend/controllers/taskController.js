// taskController.js
const pool = require('../config/db');

async function getTasks(req, res) {
  const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC', [req.userId]);
  res.json({ success: true, tasks: rows });
}

async function createTask(req, res) {
  const { title, dueDate } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Title is required.' });

  const [result] = await pool.query(
    'INSERT INTO tasks (user_id, title, due_date) VALUES (?, ?, ?)',
    [req.userId, title, dueDate || null]
  );
  res.status(201).json({ success: true, id: result.insertId });
}

async function updateTask(req, res) {
  const { title, isDone, dueDate } = req.body;
  const [result] = await pool.query(
    'UPDATE tasks SET title = ?, is_done = ?, due_date = ? WHERE id = ? AND user_id = ?',
    [title, !!isDone, dueDate || null, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Task not found.' });
  res.json({ success: true });
}

async function deleteTask(req, res) {
  const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Task not found.' });
  res.json({ success: true });
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
