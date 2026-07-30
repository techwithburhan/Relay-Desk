import pool from '../config/db.js';

// GET /api/branches — any logged-in role (needed for dropdowns everywhere)
export async function listBranches(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM branches ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch branches.' });
  }
}

// POST /api/branches  (admin only)
export async function createBranch(req, res) {
  const { name, location, manualNumber } = req.body;
  if (!name || !location) return res.status(400).json({ message: 'name and location are required.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO branches (name, location, manual_number) VALUES (?, ?, ?)',
      [name, location, manualNumber || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create branch.' });
  }
}

// PUT /api/branches/:id  (admin only)
export async function updateBranch(req, res) {
  const { name, location, manualNumber, status } = req.body;
  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('name', name);
  set('location', location);
  set('manual_number', manualNumber);
  set('status', status);

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE branches SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Branch not found.' });
    res.json({ message: 'Branch updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update branch.' });
  }
}

// DELETE /api/branches/:id  (admin only)
export async function deleteBranch(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM branches WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Branch not found.' });
    res.json({ message: 'Branch deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete branch — it may still have agents or customers linked to it.' });
  }
}
