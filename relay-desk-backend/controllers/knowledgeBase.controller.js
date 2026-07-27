import pool from '../config/db.js';

export async function listArticles(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, category, content, url, views, created_at FROM knowledge_base_articles ORDER BY views DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch articles.' });
  }
}

export async function getArticle(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM knowledge_base_articles WHERE id = ?`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Article not found.' });

    await pool.query('UPDATE knowledge_base_articles SET views = views + 1 WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch article.' });
  }
}

// POST /api/knowledge-base  (admin only)
export async function createArticle(req, res) {
  const { title, category, content, url } = req.body;
  if (!title || !category) {
    return res.status(400).json({ message: 'title and category are required.' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO knowledge_base_articles (title, category, content, url) VALUES (?, ?, ?, ?)`,
      [title, category, content || null, url || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create article.' });
  }
}

// PUT /api/knowledge-base/:id  (admin only)
export async function updateArticle(req, res) {
  const { title, category, content, url } = req.body;
  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('title', title);
  set('category', category);
  set('content', content);
  set('url', url);

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE knowledge_base_articles SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Article not found.' });
    res.json({ message: 'Article updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update article.' });
  }
}

// DELETE /api/knowledge-base/:id  (admin only)
export async function deleteArticle(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM knowledge_base_articles WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Article not found.' });
    res.json({ message: 'Article deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete article.' });
  }
}
