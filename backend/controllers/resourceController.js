// resourceController.js
// A factory that builds CRUD handlers for a "JSON blob" resource table
// (subjects, assignments, exams, tasks, notes — they're all identical
// in shape: id, user_id, data JSON). This is what lets the frontend's
// manager files stay untouched — the API just stores/returns whatever
// object shape the frontend already sends.
//
// Usage: const { list, create, update, remove } = createResourceController('tasks');

const pool = require('../config/db');

function createResourceController(tableName) {
  // Basic guard against accidental misuse — table name is only ever
  // passed by us (in the route files below), never from user input.
  const ALLOWED_TABLES = ['subjects', 'assignments', 'exams', 'tasks', 'notes'];
  if (!ALLOWED_TABLES.includes(tableName)) {
    throw new Error(`createResourceController: unknown table "${tableName}"`);
  }

  // ---------- LIST ----------
  // GET /api/<resource> — returns the array of items exactly as the
  // frontend expects (just the `data` JSON for each row).
  async function list(req, res) {
    try {
      const [rows] = await pool.query(
        `SELECT data FROM ${tableName} WHERE user_id = ? ORDER BY created_at ASC`,
        [req.userId]
      );
      res.json({ success: true, items: rows.map((row) => row.data) });
    } catch (error) {
      console.error(`${tableName} list error:`, error);
      res.status(500).json({ success: false, error: 'Server error.' });
    }
  }

  // ---------- CREATE ----------
  // POST /api/<resource> — body is the full frontend object, including
  // its client-generated `id`.
  async function create(req, res) {
    try {
      const item = req.body;
      if (!item || !item.id) {
        return res.status(400).json({ success: false, error: 'Item must include an id.' });
      }

      await pool.query(
        `INSERT INTO ${tableName} (id, user_id, data) VALUES (?, ?, ?)`,
        [item.id, req.userId, JSON.stringify(item)]
      );
      res.status(201).json({ success: true, item });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, error: 'An item with this id already exists.' });
      }
      console.error(`${tableName} create error:`, error);
      res.status(500).json({ success: false, error: 'Server error.' });
    }
  }

  // ---------- UPDATE ----------
  // PUT /api/<resource>/:id — body is the full updated object.
  async function update(req, res) {
    try {
      const item = req.body;
      const [result] = await pool.query(
        `UPDATE ${tableName} SET data = ? WHERE id = ? AND user_id = ?`,
        [JSON.stringify(item), req.params.id, req.userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Item not found.' });
      }
      res.json({ success: true, item });
    } catch (error) {
      console.error(`${tableName} update error:`, error);
      res.status(500).json({ success: false, error: 'Server error.' });
    }
  }

  // ---------- DELETE ----------
  async function remove(req, res) {
    try {
      const [result] = await pool.query(
        `DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Item not found.' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`${tableName} delete error:`, error);
      res.status(500).json({ success: false, error: 'Server error.' });
    }
  }

  return { list, create, update, remove };
}

module.exports = { createResourceController };
