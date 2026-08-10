// server.js
// Entry point — wires up middleware and mounts all route files.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const { createResourceRouter } = require('./routes/resourceRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check — useful once deployed, to confirm the API is up
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Study Planner API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', createResourceRouter('subjects'));
app.use('/api/assignments', createResourceRouter('assignments'));
app.use('/api/exams', createResourceRouter('exams'));
app.use('/api/tasks', createResourceRouter('tasks'));
app.use('/api/notes', createResourceRouter('notes'));

// 404 fallback for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
