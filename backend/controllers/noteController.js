// noteController.js
const pool = require('../config/db');

async function getNotes(req, res) {
  const [rows] = await pool.query('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json({ success: true, notes: rows });
}

async function createNote(req, res) {
  const { subjectId, title, content } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Title is required.' });

  const [result] = await pool.query(
    'INSERT INTO notes (user_id, subject_id, title, content) VALUES (?, ?, ?, ?)',
    [req.userId, subjectId || null, title, content || '']
  );
  res.status(201).json({ success: true, id: result.insertId });
}

async function updateNote(req, res) {
  const { subjectId, title, content } = req.body;
  const [result] = await pool.query(
    'UPDATE notes SET subject_id = ?, title = ?, content = ? WHERE id = ? AND user_id = ?',
    [subjectId || null, title, content || '', req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Note not found.' });
  res.json({ success: true });
}

async function deleteNote(req, res) {
  const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Note not found.' });
  res.json({ success: true });
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
