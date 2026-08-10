// authController.js
// Replaces the old localStorage-only authManager.js — passwords are now
// hashed with bcrypt and sessions are handled with JWTs instead of a
// plain object saved in localStorage.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const SALT_ROUNDS = 10;

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// ---------- REGISTER ----------
async function register(req, res) {
  try {
    const { name, email, password, university, department, semester, studyGoal } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, university, department, semester, study_goal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, university || null, department || null, semester || null, studyGoal || null]
    );

    const token = signToken(result.insertId);

    return res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, name, email },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Server error during registration.' });
  }
}

// ---------- LOGIN ----------
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    const token = signToken(user.id);

    return res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Server error during login.' });
  }
}

// ---------- CURRENT USER ----------
// GET /api/auth/me — used on page load to check "am I still logged in".
async function getCurrentUser(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, university, department, semester, study_goal FROM users WHERE id = ?',
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}

// ---------- UPDATE PROFILE ----------
// PUT /api/auth/me
async function updateMe(req, res) {
  try {
    const { name, university, department, semester, studyGoal } = req.body;

    await pool.query(
      `UPDATE users SET name = ?, university = ?, department = ?, semester = ?, study_goal = ?
       WHERE id = ?`,
      [name, university || null, department || null, semester || null, studyGoal || null, req.userId]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, university, department, semester, study_goal FROM users WHERE id = ?',
      [req.userId]
    );

    return res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('updateMe error:', error);
    return res.status(500).json({ success: false, error: 'Server error.' });
  }
}

module.exports = { register, login, getCurrentUser, updateMe };
