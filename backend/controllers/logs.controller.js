import pool from '../config/db.js';

// GET /api/logs?range=today|yesterday|last7|last30|custom&from=&to=&search=&page=&pageSize=
export async function listLogs(req, res) {
  const { range, from, to, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Number(req.query.pageSize) || 20);
  const offset = (page - 1) * pageSize;

  const clauses = [];
  const params = [];

  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (range === 'today') {
    clauses.push('created_at >= ?');
    params.push(startOfDay(now));
  } else if (range === 'yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    clauses.push('created_at >= ? AND created_at < ?');
    params.push(startOfDay(y), startOfDay(now));
  } else if (range === 'last7') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    clauses.push('created_at >= ?');
    params.push(d);
  } else if (range === 'last30') {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    clauses.push('created_at >= ?');
    params.push(d);
  } else if (range === 'custom' && from && to) {
    clauses.push('created_at >= ? AND created_at <= ?');
    params.push(new Date(from), new Date(`${to}T23:59:59`));
  }

  if (search) {
    clauses.push('(agent_email LIKE ? OR action LIKE ? OR agent_role LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM access_logs ${where}`,
      params
    );
    const [rows] = await pool.query(
      `SELECT id, agent_email, agent_role, action, ip_address, created_at
       FROM access_logs ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    res.json({ logs: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch access logs.' });
  }
}

// DELETE /api/logs/:id  (admin only)
export async function deleteLog(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM access_logs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Log entry not found.' });
    }
    res.json({ message: 'Log deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete log.' });
  }
}

// DELETE /api/logs  body: { ids: [1,2,3] }  (admin only, bulk delete)
export async function deleteLogs(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'ids must be a non-empty array.' });
  }
  try {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM access_logs WHERE id IN (${placeholders})`, ids);
    res.json({ message: `${result.affectedRows} log(s) deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete logs.' });
  }
}

// DELETE /api/logs/all  (admin only)
export async function deleteAllLogs(req, res) {
  try {
    await pool.query('DELETE FROM access_logs');
    res.json({ message: 'All logs deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete all logs.' });
  }
}
