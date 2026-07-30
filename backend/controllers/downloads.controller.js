import pool from '../config/db.js';

// GET /api/downloads — only enabled items whose visible_to list includes the caller's role
export async function listDownloads(req, res) {
  const { role } = req.agent;
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, category, file_type, file_url, icon, status, visible_to, sort_order
       FROM downloads WHERE status = 'enabled' ORDER BY category, sort_order, title`
    );
    const visible = rows.filter((d) => d.visible_to.split(',').includes(role));
    res.json(visible);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch downloads.' });
  }
}

// GET /api/downloads/admin — admin sees every download regardless of status/role
export async function listAllDownloads(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM downloads ORDER BY category, sort_order, title`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch downloads.' });
  }
}

// POST /api/downloads  (admin only)
export async function createDownload(req, res) {
  const { title, description, category, fileType, fileUrl, icon, visibleTo, status } = req.body;
  if (!title || !category || !fileType || !fileUrl) {
    return res.status(400).json({ message: 'title, category, fileType, and fileUrl are required.' });
  }
  try {
    const [[{ maxOrder } = { maxOrder: 0 }]] = await pool.query(
      'SELECT MAX(sort_order) AS maxOrder FROM downloads WHERE category = ?',
      [category]
    );
    const [result] = await pool.query(
      `INSERT INTO downloads (title, description, category, file_type, file_url, icon, status, visible_to, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description || null, category, fileType, fileUrl, icon || null,
        status || 'enabled', (visibleTo || ['admin', 'dealer', 'client']).join(','),
        (maxOrder || 0) + 1,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create download.' });
  }
}

// PUT /api/downloads/:id  (admin only)
export async function updateDownload(req, res) {
  const { id } = req.params;
  const { title, description, category, fileType, fileUrl, icon, visibleTo, status, sortOrder } = req.body;

  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('title', title);
  set('description', description);
  set('category', category);
  set('file_type', fileType);
  set('file_url', fileUrl);
  set('icon', icon);
  set('status', status);
  set('sort_order', sortOrder);
  if (visibleTo !== undefined) { fields.push('visible_to = ?'); params.push(visibleTo.join(',')); }

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(id);

  try {
    const [result] = await pool.query(`UPDATE downloads SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Download not found.' });
    res.json({ message: 'Download updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update download.' });
  }
}

// DELETE /api/downloads/:id  (admin only)
export async function deleteDownload(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM downloads WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Download not found.' });
    res.json({ message: 'Download deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete download.' });
  }
}
