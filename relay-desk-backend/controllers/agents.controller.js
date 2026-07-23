import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';

export async function listAgents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, active, created_at FROM agents ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch agents.' });
  }
}

// Used by the Agent Workload chart on the dashboard
export async function agentWorkload(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.name, COUNT(t.id) AS open_tickets
      FROM agents a
      LEFT JOIN tickets t ON t.assigned_agent_id = a.id AND t.status NOT IN ('Resolved','Closed')
      WHERE a.role != 'client'
      GROUP BY a.id
      ORDER BY open_tickets DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch agent workload.' });
  }
}

// ---------- Dealer Mapping (point 5) — admin only, enforced in routes ----------

// GET /api/agents/dealers
export async function listDealers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.name, a.email, a.active, a.last_login_at, a.created_at,
             a.branch_id, b.name AS branch_name, b.location AS branch_location
      FROM agents a
      LEFT JOIN branches b ON b.id = a.branch_id
      WHERE a.role = 'dealer'
      ORDER BY a.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dealers.' });
  }
}

// POST /api/agents/dealers  — create a new dealer login
export async function createDealer(req, res) {
  const { name, email, branchId, password } = req.body;
  if (!name || !email || !branchId) {
    return res.status(400).json({ message: 'name, email, and branchId are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const [result] = await pool.query(
      `INSERT INTO agents (name, email, password_hash, role, branch_id) VALUES (?, ?, ?, 'dealer', ?)`,
      [name, email, passwordHash, branchId]
    );
    res.status(201).json({ id: result.insertId, tempPassword: password ? undefined : 'password123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create dealer.' });
  }
}

// PATCH /api/agents/:id/access  body: { active: true|false }  — Allow Login / Disable Login
export async function setDealerAccess(req, res) {
  const { active } = req.body;
  try {
    const [result] = await pool.query('UPDATE agents SET active = ? WHERE id = ? AND role = ?', [active ? 1 : 0, req.params.id, 'dealer']);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Dealer not found.' });
    res.json({ message: active ? 'Login enabled.' : 'Login disabled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update dealer access.' });
  }
}

// POST /api/agents/:id/reset-password — generates a temp password, admin shares it manually
export async function resetDealerPassword(req, res) {
  try {
    const tempPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const [result] = await pool.query('UPDATE agents SET password_hash = ? WHERE id = ?', [passwordHash, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Agent not found.' });
    res.json({ message: 'Password reset.', tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
}
