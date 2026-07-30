import pool from '../config/db.js';

// GET /api/departments — any logged-in role (needed for the ticket form's department dropdown)
export async function listDepartments(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch departments.' });
  }
}

// POST /api/departments  (admin only)
export async function createDepartment(req, res) {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email are required.' });
  try {
    const [result] = await pool.query('INSERT INTO departments (name, email) VALUES (?, ?)', [name, email]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create department.' });
  }
}

// PUT /api/departments/:id  (admin only)
export async function updateDepartment(req, res) {
  const { name, email } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE departments SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
      [name, email, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update department.' });
  }
}

// DELETE /api/departments/:id  (admin only)
export async function deleteDepartment(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete department.' });
  }
}
