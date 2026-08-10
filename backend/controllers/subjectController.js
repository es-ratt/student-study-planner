// subjectController.js
const pool = require('../config/db');

async function getSubjects(req, res) {
  const [rows] = await pool.query('SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);
  res.json({ success: true, subjects: rows });
}

async function createSubject(req, res) {
  const { name, code, creditHours } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Subject name is required.' });

  const [result] = await pool.query(
    'INSERT INTO subjects (user_id, name, code, credit_hours) VALUES (?, ?, ?, ?)',
    [req.userId, name, code || null, creditHours || 3.0]
  );
  res.status(201).json({ success: true, id: result.insertId });
}

async function updateSubject(req, res) {
  const { name, code, creditHours } = req.body;
  const [result] = await pool.query(
    'UPDATE subjects SET name = ?, code = ?, credit_hours = ? WHERE id = ? AND user_id = ?',
    [name, code || null, creditHours || 3.0, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Subject not found.' });
  res.json({ success: true });
}

async function deleteSubject(req, res) {
  const [result] = await pool.query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Subject not found.' });
  res.json({ success: true });
}

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
