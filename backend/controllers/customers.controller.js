import pool from '../config/db.js';

const CUSTOMER_SELECT = `
  SELECT
    c.id, c.client_code, c.name, c.email, c.company, c.mobile, c.pan,
    c.branch_id, b.name AS branch_name, b.location AS branch_location,
    c.dealer_agent_id, dl.name AS dealer_name,
    c.status, c.city, c.state, c.last_login_at, c.created_at,
    COUNT(t.id) AS ticket_count,
    MAX(t.updated_at) AS last_contact
  FROM customers c
  JOIN branches b ON b.id = c.branch_id
  LEFT JOIN agents dl ON dl.id = c.dealer_agent_id
  LEFT JOIN tickets t ON t.customer_id = c.id
`;

export async function listCustomers(req, res) {
  const { branchFilter } = req; // null for admin, a branch_id for dealers

  try {
    const where = branchFilter ? 'WHERE c.branch_id = ?' : '';
    const params = branchFilter ? [branchFilter] : [];

    const [rows] = await pool.query(
      `${CUSTOMER_SELECT} ${where} GROUP BY c.id ORDER BY c.name ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers.' });
  }
}

export async function createCustomer(req, res) {
  const { name, email, company, clientCode, branchId, mobile, pan, dealerAgentId, city, state } = req.body;
  const { role, branchId: dealerBranchId } = req.agent;

  if (!name || !email || !clientCode) {
    return res.status(400).json({ message: 'name, email, and clientCode are required.' });
  }

  const finalBranchId = role === 'admin' ? branchId : dealerBranchId;
  if (!finalBranchId) {
    return res.status(400).json({ message: 'branchId is required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (client_code, name, email, company, mobile, pan, branch_id, dealer_agent_id, city, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [clientCode, name, email, company || null, mobile || null, pan || null, finalBranchId, dealerAgentId || null, city || null, state || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create customer.' });
  }
}

// PUT /api/customers/:id
export async function updateCustomer(req, res) {
  const { id } = req.params;
  const { name, email, company, mobile, pan, status, dealerAgentId, city, state } = req.body;

  const fields = [];
  const params = [];
  const set = (col, val) => { if (val !== undefined) { fields.push(`${col} = ?`); params.push(val); } };

  set('name', name);
  set('email', email);
  set('company', company);
  set('mobile', mobile);
  set('pan', pan);
  set('status', status);
  set('dealer_agent_id', dealerAgentId);
  set('city', city);
  set('state', state);

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });
  params.push(id);

  try {
    const [result] = await pool.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ message: 'Customer updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update customer.' });
  }
}

// POST /api/customers/import  body: { rows: [{ name, email, clientCode, branchId, ... }, ...] }
// Used by the Customers page's "Import Data" button (parses Excel/CSV client-side with SheetJS,
// then sends the parsed rows here for a bulk insert).
export async function importCustomers(req, res) {
  const { rows } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ message: 'rows must be a non-empty array.' });
  }

  let created = 0;
  const errors = [];

  for (const [index, row] of rows.entries()) {
    const { name, email, clientCode, branchId, company, mobile, pan, city, state } = row;
    if (!name || !email || !clientCode || !branchId) {
      errors.push({ row: index + 1, message: 'Missing name, email, clientCode, or branchId.' });
      continue;
    }
    try {
      await pool.query(
        `INSERT INTO customers (client_code, name, email, company, mobile, pan, branch_id, city, state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [clientCode, name, email, company || null, mobile || null, pan || null, branchId, city || null, state || null]
      );
      created += 1;
    } catch (err) {
      errors.push({ row: index + 1, message: err.sqlMessage || 'Insert failed (duplicate email/client code?).' });
    }
  }

  res.json({ created, failed: errors.length, errors });
}
