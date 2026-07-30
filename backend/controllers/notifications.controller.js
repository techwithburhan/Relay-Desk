import pool from '../config/db.js';

// GET /api/notifications — notifications addressed to me directly, or
// broadcast to my role
export async function listNotifications(req, res) {
  const { id, role } = req.agent;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications
       WHERE agent_id = ?
          OR (agent_id IS NULL AND FIND_IN_SET(?, target_roles))
       ORDER BY created_at DESC
       LIMIT 50`,
      [id, role]
    );
    const [[{ unread }]] = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications
       WHERE is_read = 0 AND (agent_id = ? OR (agent_id IS NULL AND FIND_IN_SET(?, target_roles)))`,
      [id, role]
    );
    res.json({ notifications: rows, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
}

// PATCH /api/notifications/:id/read
export async function markRead(req, res) {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
}

// PATCH /api/notifications/read-all
export async function markAllRead(req, res) {
  const { id, role } = req.agent;
  try {
    await pool.query(
      `UPDATE notifications SET is_read = 1
       WHERE agent_id = ? OR (agent_id IS NULL AND FIND_IN_SET(?, target_roles))`,
      [id, role]
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update notifications.' });
  }
}

// Internal helper — call this from other controllers (ticket reply, status
// change, software upload, etc.) to push a new notification. Not an HTTP
// route itself.
export async function pushNotification({ agentId = null, targetRoles = null, type, title, body, linkUrl }) {
  try {
    await pool.query(
      `INSERT INTO notifications (agent_id, target_roles, type, title, body, link_url) VALUES (?, ?, ?, ?, ?, ?)`,
      [agentId, targetRoles, type, title, body || null, linkUrl || null]
    );
  } catch (err) {
    console.error('Failed to push notification:', err);
  }
}
