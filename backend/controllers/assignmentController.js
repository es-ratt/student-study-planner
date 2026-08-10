// assignmentController.js
const pool = require('../config/db');

async function getAssignments(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM assignments WHERE user_id = ? ORDER BY due_date ASC',
    [req.userId]
  );
  res.json({ success: true, assignments: rows });
}

async function createAssignment(req, res) {
  const { subjectId, title, description, dueDate, status } = req.body;
  if (!title) return res.status(400).json({ success: false, error: 'Title is required.' });

  const [result] = await pool.query(
    `INSERT INTO assignments (user_id, subject_id, title, description, due_date, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, subjectId || null, title, description || null, dueDate || null, status || 'pending']
  );
  res.status(201).json({ success: true, id: result.insertId });
}

async function updateAssignment(req, res) {
  const { subjectId, title, description, dueDate, status } = req.body;
  const [result] = await pool.query(
    `UPDATE assignments SET subject_id = ?, title = ?, description = ?, due_date = ?, status = ?
     WHERE id = ? AND user_id = ?`,
    [subjectId || null, title, description || null, dueDate || null, status || 'pending', req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Assignment not found.' });
  res.json({ success: true });
}

async function deleteAssignment(req, res) {
  const [result] = await pool.query('DELETE FROM assignments WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Assignment not found.' });
  res.json({ success: true });
}

module.exports = { getAssignments, createAssignment, updateAssignment, deleteAssignment };
