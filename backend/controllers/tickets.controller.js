import pool from '../config/db.js';
import { pushNotification } from './notifications.controller.js';

async function logActivity(ticketId, actionType, description, performedBy) {
  try {
    await pool.query(
      `INSERT INTO ticket_activity (ticket_id, action_type, description, performed_by) VALUES (?, ?, ?, ?)`,
      [ticketId, actionType, description, performedBy || 'System']
    );
  } catch (err) {
    console.error('Failed to log ticket activity:', err);
  }
}

const TICKET_SELECT = `
  SELECT
    t.id,
    t.ticket_number,
    t.subject,
    t.requester_name,
    t.description,
    t.remark,
    t.category,
    t.priority,
    t.status,
    t.created_at,
    t.updated_at,
    c.id    AS customer_id,
    COALESCE(t.requester_name, c.name, 'Unknown') AS display_requester,
    c.email AS requester_email,
    COALESCE(t.branch_id, c.branch_id) AS branch_id,
    b.name  AS branch_name,
    b.location AS branch_location,
    a.name  AS assigned_name,
    a.id    AS assigned_agent_id,
    d.id    AS department_id,
    d.name  AS department_name,
    d.email AS department_email
  FROM tickets t
  LEFT JOIN customers c ON c.id = t.customer_id
  LEFT JOIN branches b ON b.id = COALESCE(t.branch_id, c.branch_id)
  LEFT JOIN agents a ON a.id = t.assigned_agent_id
  LEFT JOIN departments d ON d.id = t.department_id
`;

// GET /api/tickets?status=&priority=&search=&department=
// Visibility (point 5/9 of the spec):
//   admin      → everything
//   dealer     → only tickets matching their department_id AND/OR branch_id
//                (whichever the account has set), OR tickets assigned
//                directly to them
//   client     → only their own tickets
export async function listTickets(req, res) {
  const { status, priority, search, department } = req.query;
  const clauses = [];
  const params = [];

  if (req.customerFilter) {
    clauses.push('t.customer_id = ?');
    params.push(req.customerFilter);
  } else if (req.branchFilter || req.departmentFilter) {
    const scopeParts = [];
    if (req.branchFilter) { scopeParts.push('COALESCE(t.branch_id, c.branch_id) = ?'); params.push(req.branchFilter); }
    if (req.departmentFilter) { scopeParts.push('t.department_id = ?'); params.push(req.departmentFilter); }
    scopeParts.push('t.assigned_agent_id = ?');
    params.push(req.agent.id);
    clauses.push(`(${scopeParts.join(' OR ')})`);
  }

  if (status) { clauses.push('t.status = ?'); params.push(status); }
  if (priority) { clauses.push('t.priority = ?'); params.push(priority); }
  if (department) { clauses.push('t.department_id = ?'); params.push(department); }
  if (search) {
    clauses.push('(t.subject LIKE ? OR t.ticket_number LIKE ? OR COALESCE(t.requester_name, c.name) LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  try {
    const [rows] = await pool.query(`${TICKET_SELECT} ${where} ORDER BY t.created_at DESC`, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch tickets.' });
  }
}

function ticketVisibleToAgent(ticket, req) {
  if (!req.branchFilter && !req.departmentFilter && !req.customerFilter) return true; // admin
  if (req.customerFilter) return ticket.customer_id === req.customerFilter;
  if (req.branchFilter && ticket.branch_id === req.branchFilter) return true;
  if (req.departmentFilter && ticket.department_id === req.departmentFilter) return true;
  if (ticket.assigned_agent_id === req.agent.id) return true;
  return false;
}

// GET /api/tickets/:ticketNumber
export async function getTicket(req, res) {
  const { ticketNumber } = req.params;
  try {
    const [ticketRows] = await pool.query(`${TICKET_SELECT} WHERE t.ticket_number = ?`, [ticketNumber]);
    const ticket = ticketRows[0];
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    if (!ticketVisibleToAgent(ticket, req)) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }

    const [comments] = await pool.query(
      `SELECT id, author_name, author_type, body, attachment_url, attachment_name, is_read, created_at
       FROM comments WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticket.id]
    );
    const [activity] = await pool.query(
      `SELECT id, action_type, description, performed_by, created_at
       FROM ticket_activity WHERE ticket_id = ? ORDER BY created_at ASC`,
      [ticket.id]
    );
    const [transfers] = await pool.query(
      `SELECT tt.id, tt.status, tt.created_at, tt.resolved_at,
              df.name AS from_department_name, dt.name AS to_department_name
       FROM ticket_transfers tt
       LEFT JOIN departments df ON df.id = tt.from_department_id
       JOIN departments dt ON dt.id = tt.to_department_id
       WHERE tt.ticket_id = ? ORDER BY tt.created_at DESC`,
      [ticket.id]
    );

    // Internal Remark visibility (point 10): Admin-controlled, separately
    // for Customer and Dealer.
    let visibleRemark = ticket.remark;
    if (req.agent.role === 'client') {
      const [[setting]] = await pool.query(`SELECT setting_value FROM app_settings WHERE setting_key = 'remark_visible_to_customer'`);
      if (!setting || setting.setting_value === 'false') visibleRemark = null;
    } else if (req.agent.role === 'dealer') {
      const [[setting]] = await pool.query(`SELECT setting_value FROM app_settings WHERE setting_key = 'remark_visible_to_dealer'`);
      if (!setting || setting.setting_value === 'false') visibleRemark = null;
    }

    res.json({ ...ticket, remark: visibleRemark, comments, activity, transfers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch ticket.' });
  }
}

// POST /api/tickets
// Requester is now a free-text name (no customer account required).
// Department replaces the old "assign to a customer" flow — if the
// department picked is literally "Branch", branchId must be supplied too.
export async function createTicket(req, res) {
  const {
    subject, requesterName, description, category, priority,
    departmentId, branchId, customerId, assignedAgentId,
    attachmentUrl, attachmentName,
  } = req.body;

  if (!subject || !requesterName) {
    return res.status(400).json({ message: 'subject and requesterName are required.' });
  }

  try {
    const [[{ maxNum }]] = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number, 3) AS UNSIGNED)), 98000) AS maxNum FROM tickets`
    );
    const ticketNumber = `T-${maxNum + 1}`;

    const [result] = await pool.query(
      `INSERT INTO tickets (ticket_number, subject, requester_name, description, category, priority, status, customer_id, assigned_agent_id, department_id, branch_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, ?)`,
      [
        ticketNumber, subject, requesterName, description || null, category || null, priority || 'Medium',
        customerId || null, assignedAgentId || null, departmentId || null, branchId || null,
      ]
    );

    await logActivity(result.insertId, 'created', `Ticket created by ${requesterName}.`, requesterName);

    if (attachmentUrl) {
      await pool.query(
        `INSERT INTO comments (ticket_id, author_name, author_type, body, attachment_url, attachment_name)
         VALUES (?, 'System', 'system', 'Attachment uploaded with the ticket.', ?, ?)`,
        [result.insertId, attachmentUrl, attachmentName || 'attachment']
      );
      await logActivity(result.insertId, 'attachment_uploaded', `Attachment "${attachmentName || 'file'}" uploaded.`, requesterName);
    }

    if (departmentId) {
      const [[dept]] = await pool.query('SELECT name FROM departments WHERE id = ?', [departmentId]);
      if (dept) {
        await logActivity(result.insertId, 'department_assigned', `Assigned to ${dept.name}.`, 'System');
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
// Admin and permitted Dealers (agents.can_change_status = 1) can update.
export async function updateTicket(req, res) {
  const { ticketNumber } = req.params;
  const { status, priority, assignedAgentId, departmentId, remark } = req.body;
  const actorName = req.agent.name;

  const fields = [];
  const params = [];

  if (status) { fields.push('status = ?'); params.push(status); }
  if (priority) { fields.push('priority = ?'); params.push(priority); }
  if (assignedAgentId !== undefined) { fields.push('assigned_agent_id = ?'); params.push(assignedAgentId); }
  if (departmentId !== undefined) { fields.push('department_id = ?'); params.push(departmentId); }
  if (remark !== undefined) { fields.push('remark = ?'); params.push(remark); }

  if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });

  try {
    const [[existing]] = await pool.query(`${TICKET_SELECT} WHERE t.ticket_number = ?`, [ticketNumber]);
    if (!existing) return res.status(404).json({ message: 'Ticket not found.' });
    if (!ticketVisibleToAgent(existing, req)) {
      return res.status(403).json({ message: 'You do not have access to this ticket.' });
    }

    if (status && req.agent.role !== 'admin' && !req.agent.canChangeStatus) {
      return res.status(403).json({ message: 'Your account does not have permission to change ticket status.' });
    }

    params.push(ticketNumber);
    const [result] = await pool.query(`UPDATE tickets SET ${fields.join(', ')} WHERE ticket_number = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found.' });

    if (status && status !== existing.status) {
      await logActivity(existing.id, 'status_changed', `Status changed: ${existing.status} → ${status}`, actorName);
      await pushNotification({
        targetRoles: 'admin,dealer,client',
        type: 'ticket_status',
        title: `Ticket ${ticketNumber} status changed`,
        body: `Status is now: ${status}`,
        linkUrl: `/tickets/${ticketNumber}`,
      });
    }
    if (remark !== undefined) {
      await logActivity(existing.id, 'remark_added', `Internal remark updated.`, actorName);
    }

    res.json({ message: 'Ticket updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update ticket.' });
  }
}

// DELETE /api/tickets/:ticketNumber  (admin only)
export async function deleteTicket(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM tickets WHERE ticket_number = ?', [req.params.ticketNumber]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found.' });
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

  if (!authorName || !body) return res.status(400).json({ message: 'authorName and body are required.' });

  try {
    const [[ticket]] = await pool.query('SELECT id FROM tickets WHERE ticket_number = ?', [ticketNumber]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    await pool.query(
      `INSERT INTO comments (ticket_id, author_name, author_type, body, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?, ?)`,
      [ticket.id, authorName, authorType || 'agent', body, attachmentUrl || null, attachmentName || null]
    );
    await pool.query('UPDATE tickets SET updated_at = NOW() WHERE id = ?', [ticket.id]);
    await logActivity(ticket.id, authorType === 'internal_note' ? 'remark_added' : 'reply_added', `${authorName} replied.`, authorName);

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

// ---------- Ticket Transfer workflow ----------

// POST /api/tickets/:ticketNumber/transfer  body: { toDepartmentId }
export async function requestTransfer(req, res) {
  const { ticketNumber } = req.params;
  const { toDepartmentId } = req.body;
  if (!toDepartmentId) return res.status(400).json({ message: 'toDepartmentId is required.' });

  try {
    const [[ticket]] = await pool.query('SELECT id, department_id FROM tickets WHERE ticket_number = ?', [ticketNumber]);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const [result] = await pool.query(
      `INSERT INTO ticket_transfers (ticket_id, from_department_id, to_department_id, requested_by) VALUES (?, ?, ?, ?)`,
      [ticket.id, ticket.department_id, toDepartmentId, req.agent.id]
    );

    const [[toDept]] = await pool.query('SELECT name FROM departments WHERE id = ?', [toDepartmentId]);
    await logActivity(ticket.id, 'department_transferred', `Transfer requested to ${toDept?.name || 'another department'} (pending approval).`, req.agent.name);

    await pushNotification({
      targetRoles: 'admin,dealer',
      type: 'ticket_status',
      title: 'Ticket Transfer Request',
      body: `${ticketNumber} requested to move to ${toDept?.name || 'another department'}`,
      linkUrl: `/tickets/${ticketNumber}`,
    });

    res.status(201).json({ id: result.insertId, message: 'Transfer request sent — pending approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to request transfer.' });
  }
}

// GET /api/transfers/pending — transfer requests awaiting this agent's department
export async function listPendingTransfers(req, res) {
  try {
    const params = [];
    let where = `tt.status = 'pending'`;
    if (req.agent.role !== 'admin') {
      where += ' AND tt.to_department_id = ?';
      params.push(req.agent.departmentId);
    }
    const [rows] = await pool.query(
      `SELECT tt.id, tt.ticket_id, t.ticket_number, t.subject, tt.status, tt.created_at,
              df.name AS from_department_name, dt.name AS to_department_name
       FROM ticket_transfers tt
       JOIN tickets t ON t.id = tt.ticket_id
       LEFT JOIN departments df ON df.id = tt.from_department_id
       JOIN departments dt ON dt.id = tt.to_department_id
       WHERE ${where}
       ORDER BY tt.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch pending transfers.' });
  }
}

// POST /api/transfers/:id/accept
export async function acceptTransfer(req, res) {
  try {
    const [[transfer]] = await pool.query('SELECT * FROM ticket_transfers WHERE id = ?', [req.params.id]);
    if (!transfer) return res.status(404).json({ message: 'Transfer request not found.' });

    await pool.query(`UPDATE ticket_transfers SET status = 'accepted', resolved_at = NOW() WHERE id = ?`, [transfer.id]);
    await pool.query('UPDATE tickets SET department_id = ? WHERE id = ?', [transfer.to_department_id, transfer.ticket_id]);

    const [[dept]] = await pool.query('SELECT name FROM departments WHERE id = ?', [transfer.to_department_id]);
    await logActivity(transfer.ticket_id, 'department_transferred', `Transfer accepted — ticket moved to ${dept?.name}.`, req.agent.name);

    res.json({ message: 'Transfer accepted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to accept transfer.' });
  }
}

// POST /api/transfers/:id/reject
export async function rejectTransfer(req, res) {
  try {
    const [[transfer]] = await pool.query('SELECT * FROM ticket_transfers WHERE id = ?', [req.params.id]);
    if (!transfer) return res.status(404).json({ message: 'Transfer request not found.' });

    await pool.query(`UPDATE ticket_transfers SET status = 'rejected', resolved_at = NOW() WHERE id = ?`, [transfer.id]);
    await logActivity(transfer.ticket_id, 'department_transferred', `Transfer request rejected.`, req.agent.name);

    res.json({ message: 'Transfer rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reject transfer.' });
  }
}
