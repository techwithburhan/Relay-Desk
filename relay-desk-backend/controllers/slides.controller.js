import pool from '../config/db.js';

const MAX_SLIDES = 4;

// GET /api/slides — public (Login page needs this before auth)
export async function listSlides(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, image_url, product_image_url, title, subtitle, description, button_text, button_url, sort_order
       FROM login_slides WHERE status = 'enabled' ORDER BY sort_order ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch slides.' });
  }
}

// GET /api/slides/admin — admin sees every slide, enabled or not
export async function listAllSlides(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM login_slides ORDER BY sort_order ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch slides.' });
  }
}

// POST /api/slides  (admin only) — enforces max 4 total slides
export async function createSlide(req, res) {
  const { imageUrl, productImageUrl, title, subtitle, description, buttonText, buttonUrl } = req.body;

  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM login_slides');
    if (count >= MAX_SLIDES) {
      return res.status(400).json({ message: `Maximum ${MAX_SLIDES} slides allowed. Delete one before adding another.` });
    }

    const [[{ maxOrder } = { maxOrder: 0 }]] = await pool.query(
      'SELECT MAX(sort_order) AS maxOrder FROM login_slides'
    );

    const [result] = await pool.query(
      `INSERT INTO login_slides (image_url, product_image_url, title, subtitle, description, button_text, button_url, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [imageUrl || null, productImageUrl || null, title || null, subtitle || null, description || null, buttonText || null, buttonUrl || null, (maxOrder || 0) + 1]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create slide.' });
  }
}

// PUT /api/slides/:id  (admin only)
export async function updateSlide(req, res) {
  const { id } = req.params;
  const { imageUrl, productImageUrl, title, subtitle, description, buttonText, buttonUrl, status, sortOrder } = req.body;

  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('image_url', imageUrl);
  set('product_image_url', productImageUrl);
  set('title', title);
  set('subtitle', subtitle);
  set('description', description);
  set('button_text', buttonText);
  set('button_url', buttonUrl);
  set('status', status);
  set('sort_order', sortOrder);

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(id);

  try {
    const [result] = await pool.query(`UPDATE login_slides SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Slide not found.' });
    res.json({ message: 'Slide updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update slide.' });
  }
}

// DELETE /api/slides/:id  (admin only)
export async function deleteSlide(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM login_slides WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Slide not found.' });
    res.json({ message: 'Slide deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete slide.' });
  }
}

// PUT /api/slides/reorder  body: { order: [id1, id2, id3] }  (admin only)
export async function reorderSlides(req, res) {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ message: 'order must be an array of slide IDs.' });
  }
  try {
    await Promise.all(
      order.map((id, index) =>
        pool.query('UPDATE login_slides SET sort_order = ? WHERE id = ?', [index + 1, id])
      )
    );
    res.json({ message: 'Slide order updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reorder slides.' });
  }
}
