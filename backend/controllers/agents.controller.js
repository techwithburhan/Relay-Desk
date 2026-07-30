import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';

// Full user profile — Full Name, Email, Role, Department, Branch ID,
// Branch Location, Manual Branch Number (point 4 of the spec).
export async function listAgents(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.name, a.email, a.role, a.active, a.can_change_status, a.branch_number,
             a.created_at, a.last_login_at,
             a.branch_id, b.name AS branch_name, b.location AS branch_location, b.manual_number AS branch_manual_number,
             a.department_id, d.name AS department_name
      FROM agents a
      LEFT JOIN branches b ON b.id = a.branch_id
      LEFT JOIN departments d ON d.id = a.department_id
      ORDER BY a.name ASC
    `);
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

// ---------- Full user management (Admin can add/delete Admin/Dealer/Client logins) ----------

// POST /api/agents  — create a user of any role
export async function createAgent(req, res) {
  const { name, email, role, branchId, departmentId, branchNumber, customerId, canChangeStatus, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'name, email, and role are required.' });
  }
  if (role === 'client' && !branchId && !customerId) {
    return res.status(400).json({ message: 'A branch is required to create a Client login (used to auto-create their customer record).' });
  }

  try {
    let linkedCustomerId = customerId || null;

    // Every Client login must have a linked customer record (this is what
    // scopes their tickets to "only their own"). If the admin didn't pick
    // an existing customer, auto-create one from the name/email/branch.
    if (role === 'client' && !linkedCustomerId) {
      const [[{ maxCode } = { maxCode: 0 }]] = await pool.query(
        `SELECT COUNT(*) AS maxCode FROM customers WHERE branch_id = ?`,
        [branchId]
      );
      const clientCode = `AUTO-${branchId}-${Date.now().toString().slice(-6)}`;
      const [custResult] = await pool.query(
        `INSERT INTO customers (client_code, name, email, branch_id, status) VALUES (?, ?, ?, ?, 'active')`,
        [clientCode, name, email, branchId]
      );
      linkedCustomerId = custResult.insertId;
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const [result] = await pool.query(
      `INSERT INTO agents (name, email, password_hash, role, branch_id, department_id, branch_number, customer_id, can_change_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, passwordHash, role,
        branchId || null,
        departmentId || null,
        branchNumber || null,
        role === 'client' ? linkedCustomerId : null,
        canChangeStatus === undefined ? 1 : (canChangeStatus ? 1 : 0),
      ]
    );
    res.status(201).json({ id: result.insertId, tempPassword: password ? undefined : 'password123' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to create user.' });

  }
}

// PUT /api/agents/:id  — update profile fields (department, branch, branch number, permission)
export async function updateAgent(req, res) {
  const { departmentId, branchId, branchNumber, canChangeStatus } = req.body;
  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('department_id', departmentId);
  set('branch_id', branchId);
  set('branch_number', branchNumber);
  if (canChangeStatus !== undefined) { fields.push('can_change_status = ?'); params.push(canChangeStatus ? 1 : 0); }

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(req.params.id);

  try {
    const [result] = await pool.query(`UPDATE agents SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user.' });
  }
}

// DELETE /api/agents/:id  — admin only
export async function deleteAgent(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM agents WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete user.' });
  }
}

// ---------- Dealer Mapping — admin only, enforced in routes ----------

export async function listDealers(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT a.id, a.name, a.email, a.active, a.can_change_status, a.branch_number, a.last_login_at, a.created_at,
             a.branch_id, b.name AS branch_name, b.location AS branch_location,
             a.department_id, d.name AS department_name
      FROM agents a
      LEFT JOIN branches b ON b.id = a.branch_id
      LEFT JOIN departments d ON d.id = a.department_id
      WHERE a.role = 'dealer'
      ORDER BY a.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dealers.' });
  }
}

export async function createDealer(req, res) {
  const { name, email, branchId, departmentId, branchNumber, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const [result] = await pool.query(
      `INSERT INTO agents (name, email, password_hash, role, branch_id, department_id, branch_number) VALUES (?, ?, ?, 'dealer', ?, ?, ?)`,
      [name, email, passwordHash, branchId || null, departmentId || null, branchNumber || null]
    );
    res.status(201).json({ id: result.insertId, tempPassword: password ? undefined : 'password123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create dealer.' });
  }
}

// PATCH /api/agents/:id/access  body: { active: true|false }
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

// PATCH /api/agents/:id/status-permission  body: { canChangeStatus: true|false }
// User Management: Admin can enable/disable a user's right to change ticket status.
export async function setStatusPermission(req, res) {
  const { canChangeStatus } = req.body;
  try {
    const [result] = await pool.query('UPDATE agents SET can_change_status = ? WHERE id = ?', [canChangeStatus ? 1 : 0, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: canChangeStatus ? 'Status-change permission enabled.' : 'Status-change permission disabled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update permission.' });
  }
}

// POST /api/agents/:id/reset-password
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
