import pool from '../config/db.js';

// GET /api/reports/stats  → powers the 5 stat cards on the Overview page
export async function stats(req, res) {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM tickets');
    const [[{ open }]] = await pool.query(
      `SELECT COUNT(*) AS open FROM tickets WHERE status != 'Solved'`
    );
    const [[{ solvedToday }]] = await pool.query(
      `SELECT COUNT(*) AS solvedToday FROM tickets
       WHERE status = 'Solved' AND DATE(updated_at) = CURDATE()`
    );
    const [[{ avgResolutionHours }]] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) / 60 AS avgResolutionHours
      FROM tickets WHERE status = 'Solved'
    `);

    res.json({
      totalTickets: total,
      openTickets: open,
      solvedToday,
      avgResolutionHours: avgResolutionHours ? Number(avgResolutionHours.toFixed(1)) : 0,
      // CSAT isn't tracked yet — wire this up once you add a ratings table
      csatScore: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
}

// GET /api/reports/priority-volume  → powers the Volume by Priority donut
export async function priorityVolume(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT priority, COUNT(*) AS count
      FROM tickets
      WHERE status != 'Solved'
      GROUP BY priority
    `);
    const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
    const withPct = rows.map((r) => ({
      priority: r.priority,
      count: r.count,
      pct: Math.round((r.count / total) * 100),
    }));
    res.json({ total, breakdown: withPct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch priority volume.' });
  }
}

// GET /api/reports/tickets-by-branch  → Admin's "open tickets, separated by location" view
export async function ticketsByBranch(req, res) {
  const { branchFilter, customerFilter } = req;
  try {
    const clauses = [`t.status != 'Solved'`];
    const params = [];
    if (branchFilter) { clauses.push('c.branch_id = ?'); params.push(branchFilter); }
    if (customerFilter) { clauses.push('c.id = ?'); params.push(customerFilter); }

    const [rows] = await pool.query(
      `
      SELECT b.id AS branch_id, b.name AS branch_name, b.location, COUNT(t.id) AS open_count
      FROM branches b
      LEFT JOIN customers c ON c.branch_id = b.id
      LEFT JOIN tickets t ON t.customer_id = c.id AND ${clauses.join(' AND ')}
      GROUP BY b.id
      ORDER BY open_count DESC
      `,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tickets by branch.' });
  }
}
export async function trend(req, res) {
  try {
    const [created] = await pool.query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);
    const [resolved] = await pool.query(`
      SELECT DATE(updated_at) AS day, COUNT(*) AS count
      FROM tickets
      WHERE status = 'Solved' AND updated_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(updated_at)
      ORDER BY day ASC
    `);
    res.json({ created, resolved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch trend data.' });
  }
}
