import pool from '../config/db.js';
import { pushNotification } from './notifications.controller.js';

const TICKET_SELECT = `
  SELECT
    t.id,
    t.ticket_number,
    t.subject,
    t.description,
    t.category,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    c.id    AS customer_id,
    c.name  AS requester_name,
    c.email AS requester_email,
    c.branch_id AS branch_id,
    b.name  AS branch_name,
    b.location AS branch_location,
    a.name  AS assigned_name,
    a.id    AS assigned_agent_id,
    d.id    AS department_id,
    d.name  AS department_name,
    d.email AS department_email
  FROM tickets t
  JOIN customers c ON c.id = t.customer_id
  JOIN branches b ON b.id = c.branch_id
  LEFT JOIN agents a ON a.id = t.assigned_agent_id
  LEFT JOIN departments d ON d.id = t.department_id
`;

// GET /api/tickets?status=Open&priority=High&search=login&department=7
// Admin: sees every ticket, every branch (location shown per row).
// Dealer: only tickets whose client belongs to their branch.
// Client: only their own tickets.
export async function listTickets(req, res) {
  const { status, priority, search, department } = req.query;
  const { branchFilter, customerFilter } = req;
  const clauses = [];
  const params = [];

  if (branchFilter) {
    clauses.push('c.branch_id = ?');
    params.push(branchFilter);
  }
  if (customerFilter) {
    clauses.push('c.id = ?');
    params.push(customerFilter);
  }
  if (status) {
    clauses.push('t.status = ?');
    params.push(status);
  }
  if (priority) {
    clauses.push('t.priority = ?');
    params.push(priority);
  }
  if (department) {
    clauses.push('t.department_id = ?');
    params.push(department);
  }
  if (search) {
    clauses.push('(t.subject LIKE ? OR t.ticket_number LIKE ? OR c.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(
      `${TICKET_SELECT} ${where} ORDER BY t.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tickets.' });
  }
}

// GET /api/tickets/:ticketNumber  (e.g. T-98051)
export async function getTicket(req, res) {
  const { ticketNumber } = req.params;
  const { branchFilter, customerFilter } = req;

  try {
    const [ticketRows] = await pool.query(
      `${TICKET_SELECT} WHERE t.ticket_number = ?`,
      [ticketNumber]
    );
    const ticket = ticketRows[0];

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (branchFilter && ticket.branch_id !== branchFilter) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }
    if (customerFilter && ticket.customer_id !== customerFilter) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }

    const [comments] = await pool.query(
      `SELECT id, author_name, author_type, body, attachment_url, attachment_name, is_read, created_at
       FROM comments WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticket.id]
    );

    res.json({ ...ticket, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch ticket.' });
  }
}

// POST /api/tickets
export async function createTicket(req, res) {
  const { subject, description, category, priority, customerId, assignedAgentId, departmentId, attachmentUrl, attachmentName } = req.body;
  const { branchFilter, customerFilter } = req;

  if (!subject || !customerId) {
    return res.status(400).json({ message: 'subject and customerId are required.' });
  }

  try {
    if (customerFilter && Number(customerId) !== customerFilter) {
      return res.status(403).json({ message: 'You can only create tickets for your own account.' });
    }

    if (branchFilter) {
      const [[customer]] = await pool.query(
        'SELECT branch_id FROM customers WHERE id = ?',
        [customerId]
      );
      if (!customer || customer.branch_id !== branchFilter) {
        return res.status(403).json({ message: 'You can only create tickets for clients in your own branch.' });
      }
    }

    const [[{ maxNum }]] = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number, 3) AS UNSIGNED)), 98000) AS maxNum FROM tickets`
    );
    const ticketNumber = `T-${maxNum + 1}`;

    const [result] = await pool.query(
      `INSERT INTO tickets (ticket_number, subject, description, category, priority, status, customer_id, assigned_agent_id, department_id)
       VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?)`,
      [ticketNumber, subject, description || null, category || null, priority || 'Medium', customerId, assignedAgentId || null, departmentId || null]
    );

    // If an attachment was included, store it as the first comment on the thread.
    if (attachmentUrl) {
      await pool.query(
        `INSERT INTO comments (ticket_id, author_name, author_type, body, attachment_url, attachment_name)
         VALUES (?, 'System', 'system', 'Attachment uploaded with the ticket.', ?, ?)`,
        [result.insertId, attachmentUrl, attachmentName || 'attachment']
      );
    }

    if (departmentId) {
      const [[dept]] = await pool.query('SELECT name FROM departments WHERE id = ?', [departmentId]);
      if (dept) {
        await pushNotification({
          targetRoles: 'admin,dealer',
          type: 'ticket_status',
          title: `New ticket assigned to ${dept.name}`,
          body: `${ticketNumber}: ${subject}`,
          linkUrl: `/tickets/${ticketNumber}`,
        });
      }
    }

    res.status(201).json({ id: result.insertId, ticketNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create ticket.' });
  }
}

// PATCH /api/tickets/:ticketNumber
// Admin-only route (see routes file) — this is where ticket STATUS changes.
// Dealers/clients cannot hit this endpoint at all.
export async function updateTicket(req, res) {
  const { ticketNumber } = req.params;
  const { status, priority, assignedAgentId, departmentId } = req.body;

  const fields = [];
  const params = [];

  if (status) { fields.push('status = ?'); params.push(status); }
  if (priority) { fields.push('priority = ?'); params.push(priority); }
  if (assignedAgentId !== undefined) { fields.push('assigned_agent_id = ?'); params.push(assignedAgentId); }
  if (departmentId !== undefined) { fields.push('department_id = ?'); params.push(departmentId); }

  if (!fields.length) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  params.push(ticketNumber);

  try {
    const [result] = await pool.query(
      `UPDATE tickets SET ${fields.join(', ')} WHERE ticket_number = ?`,
      params
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (status) {
      const [[ticket]] = await pool.query('SELECT customer_id FROM tickets WHERE ticket_number = ?', [ticketNumber]);
      await pushNotification({
        targetRoles: 'admin,dealer,client',
        type: 'ticket_status',
        title: `Ticket ${ticketNumber} status changed`,
        body: `Status is now: ${status}`,
        linkUrl: `/tickets/${ticketNumber}`,
      });
    }

    res.json({ message: 'Ticket updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update ticket.' });
  }
}

// DELETE /api/tickets/:ticketNumber  (admin only, enforced in routes)
export async function deleteTicket(req, res) {
  const { ticketNumber } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tickets WHERE ticket_number = ?', [ticketNumber]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }
    res.json({ message: 'Ticket deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete ticket.' });
  }
}

// POST /api/tickets/:ticketNumber/comments
export async function addComment(req, res) {
  const { ticketNumber } = req.params;
  const { authorName, authorType, body, attachmentUrl, attachmentName } = req.body;

  if (!authorName || !body) {
    return res.status(400).json({ message: 'authorName and body are required.' });
  }

  try {
    const [[ticket]] = await pool.query(
      'SELECT id FROM tickets WHERE ticket_number = ?',
      [ticketNumber]
    );
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    await pool.query(
      `INSERT INTO comments (ticket_id, author_name, author_type, body, attachment_url, attachment_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ticket.id, authorName, authorType || 'agent', body, attachmentUrl || null, attachmentName || null]
    );
    await pool.query('UPDATE tickets SET updated_at = NOW() WHERE id = ?', [ticket.id]);

    await pushNotification({
      targetRoles: 'admin,dealer,client',
      type: 'ticket_reply',
      title: 'New Ticket Reply',
      body: `${ticketNumber} was updated by ${authorName}`,
      linkUrl: `/tickets/${ticketNumber}`,
    });

    res.status(201).json({ message: 'Comment added.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add comment.' });
  }
}
