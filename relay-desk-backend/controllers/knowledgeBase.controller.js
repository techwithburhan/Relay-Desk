import pool from '../config/db.js';

export async function listArticles(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, category, views, created_at FROM knowledge_base_articles ORDER BY views DESC`
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
