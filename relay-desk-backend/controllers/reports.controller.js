import pool from '../config/db.js';

function buildScope(req) {
  const clauses = [];
  const params = [];
  if (req.customerFilter) {
    clauses.push('t.customer_id = ?');
    params.push(req.customerFilter);
  } else if (req.branchFilter || req.departmentFilter) {
    const parts = [];
    if (req.branchFilter) { parts.push('COALESCE(t.branch_id, c.branch_id) = ?'); params.push(req.branchFilter); }
    if (req.departmentFilter) { parts.push('t.department_id = ?'); params.push(req.departmentFilter); }
    clauses.push(`(${parts.join(' OR ')})`);
  }
  return { clause: clauses.length ? `AND ${clauses.join(' AND ')}` : '', params };
}

// GET /api/reports/stats  → powers the 5 stat cards on the Overview page,
// and the real Tickets count badge in the sidebar (admin/dealer only).
export async function stats(req, res) {
  const { clause, params } = buildScope(req);
  const base = `FROM tickets t LEFT JOIN customers c ON c.id = t.customer_id WHERE 1=1 ${clause}`;

  try {
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${base}`, params);
    const [[{ open }]] = await pool.query(
      `SELECT COUNT(*) AS open ${base} AND t.status NOT IN ('Resolved','Closed')`,
      params
    );
    const [[{ solvedToday }]] = await pool.query(
      `SELECT COUNT(*) AS solvedToday ${base} AND t.status = 'Resolved' AND DATE(t.updated_at) = CURDATE()`,
      params
    );
    const [[{ avgResolutionHours }]] = await pool.query(
      `SELECT AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.updated_at)) / 60 AS avgResolutionHours ${base} AND t.status = 'Resolved'`,
      params
    );

    res.json({
      totalTickets: total,
      openTickets: open,
      solvedToday,
      avgResolutionHours: avgResolutionHours ? Number(avgResolutionHours.toFixed(1)) : 0,
      csatScore: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
}

// GET /api/reports/priority-volume  → powers the Volume by Priority donut
export async function priorityVolume(req, res) {
  const { clause, params } = buildScope(req);
  try {
    const [rows] = await pool.query(
      `SELECT t.priority, COUNT(*) AS count
       FROM tickets t LEFT JOIN customers c ON c.id = t.customer_id
       WHERE t.status NOT IN ('Resolved','Closed') ${clause}
       GROUP BY t.priority`,
      params
    );
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
    const clauses = [`t.status NOT IN ('Resolved','Closed')`];
    const params = [];
    if (branchFilter) { clauses.push('b.id = ?'); params.push(branchFilter); }
    if (customerFilter) { clauses.push('c.id = ?'); params.push(customerFilter); }

    const [rows] = await pool.query(
      `
      SELECT b.id AS branch_id, b.name AS branch_name, b.location, COUNT(t.id) AS open_count
      FROM branches b
      LEFT JOIN tickets t ON COALESCE(t.branch_id, (SELECT c2.branch_id FROM customers c2 WHERE c2.id = t.customer_id)) = b.id AND ${clauses.join(' AND ')}
      LEFT JOIN customers c ON c.id = t.customer_id
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

// GET /api/reports/trend  → last 7 days, created vs resolved
export async function trend(req, res) {
  const { clause, params } = buildScope(req);
  try {
    const [created] = await pool.query(
      `SELECT DATE(t.created_at) AS day, COUNT(*) AS count
       FROM tickets t LEFT JOIN customers c ON c.id = t.customer_id
       WHERE t.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ${clause}
       GROUP BY DATE(t.created_at) ORDER BY day ASC`,
      params
    );
    const [resolved] = await pool.query(
      `SELECT DATE(t.updated_at) AS day, COUNT(*) AS count
       FROM tickets t LEFT JOIN customers c ON c.id = t.customer_id
       WHERE t.status = 'Resolved' AND t.updated_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ${clause}
       GROUP BY DATE(t.updated_at) ORDER BY day ASC`,
      params
    );
    res.json({ created, resolved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch trend data.' });
  }
}
