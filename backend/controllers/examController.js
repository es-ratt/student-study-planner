// examController.js
const pool = require('../config/db');

async function getExams(req, res) {
  const [rows] = await pool.query('SELECT * FROM exams WHERE user_id = ? ORDER BY exam_date ASC', [req.userId]);
  res.json({ success: true, exams: rows });
}

async function createExam(req, res) {
  const { subjectId, title, examDate, reminderDate } = req.body;
  if (!title || !examDate) {
    return res.status(400).json({ success: false, error: 'Title and exam date are required.' });
  }

  const [result] = await pool.query(
    'INSERT INTO exams (user_id, subject_id, title, exam_date, reminder_date) VALUES (?, ?, ?, ?, ?)',
    [req.userId, subjectId || null, title, examDate, reminderDate || null]
  );
  res.status(201).json({ success: true, id: result.insertId });
}

async function updateExam(req, res) {
  const { subjectId, title, examDate, reminderDate } = req.body;
  const [result] = await pool.query(
    'UPDATE exams SET subject_id = ?, title = ?, exam_date = ?, reminder_date = ? WHERE id = ? AND user_id = ?',
    [subjectId || null, title, examDate, reminderDate || null, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Exam not found.' });
  res.json({ success: true });
}

async function deleteExam(req, res) {
  const [result] = await pool.query('DELETE FROM exams WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Exam not found.' });
  res.json({ success: true });
}

module.exports = { getExams, createExam, updateExam, deleteExam };
