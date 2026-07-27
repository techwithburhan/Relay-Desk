import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { hasActiveLicense } from './license.controller.js';

async function logAccess({ agentId, email, role, action, req }) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    await pool.query(
      `INSERT INTO access_logs (agent_id, agent_email, agent_role, action, ip_address) VALUES (?, ?, ?, ?, ?)`,
      [agentId || null, email, role || 'unknown', action, ip]
    );
  } catch (err) {
    console.error('Failed to write access log:', err);
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Point 8 (License Management): block ALL logins while there's no
    // active license — the /license page itself stays reachable without
    // a login, so an admin can recover by entering a valid key there.
    if (!(await hasActiveLicense())) {
      return res.status(423).json({
        message: 'License Expired. Please contact your administrator.',
        code: 'LICENSE_EXPIRED',
      });
    }

    const [rows] = await pool.query('SELECT * FROM agents WHERE email = ? LIMIT 1', [email]);
    const agent = rows[0];

    if (!agent) {
      await logAccess({ email, action: 'login_failed', req });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, agent.password_hash);
    if (!isValid) {
      await logAccess({ agentId: agent.id, email, role: agent.role, action: 'login_failed', req });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Dealer Mapping (point 5): a disabled login must be blocked here too,
    // not just hidden in the UI.
    if (!agent.active) {
      await logAccess({ agentId: agent.id, email, role: agent.role, action: 'login_failed', req });
      return res.status(403).json({ message: 'This account has been disabled. Contact your administrator.' });
    }

    // point 8(d): "Login — one user only per browser" is enforced client-side
    // (a fresh sessionStorage session per browser tab/window); this backend
    // simply issues a fresh token on every successful login.
    const payload = {
      id: agent.id,
      name: agent.name,
      email: agent.email,
      role: agent.role,          // 'admin' | 'dealer' | 'client'
      branchId: agent.branch_id, // null for admins
      departmentId: agent.department_id, // which department this user handles
      customerId: agent.customer_id, // only set for role='client'
      canChangeStatus: Boolean(agent.can_change_status),
    };

    const [[{ setting_value: timeoutMinutes } = { setting_value: '10' }]] = await pool.query(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'session_timeout_minutes'`
    );

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    await logAccess({ agentId: agent.id, email, role: agent.role, action: 'login', req });
    await pool.query('UPDATE agents SET last_login_at = NOW() WHERE id = ?', [agent.id]);
    if (agent.customer_id) {
      await pool.query('UPDATE customers SET last_login_at = NOW() WHERE id = ?', [agent.customer_id]);
    }

    res.json({
      token,
      agent: payload,
      sessionTimeoutMinutes: Number(timeoutMinutes) || 10,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while logging in.' });
  }
}

export async function logout(req, res) {
  const { agent } = req;
  await logAccess({ agentId: agent.id, email: agent.email, role: agent.role, action: 'logout', req });
  res.json({ message: 'Logged out.' });
}

export async function me(req, res) {
  res.json({ agent: req.agent });
}

// ---------- Forgot Password (point 9) ----------

// POST /api/auth/forgot-password  body: { email }
// No email service is wired up yet, so the reset link is returned directly
// in the response (and logged server-side) — swap this for a real email
// send once you have a provider configured.
export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const [[agent]] = await pool.query('SELECT id FROM agents WHERE email = ?', [email]);

    // Always respond the same way whether or not the email exists, so this
    // endpoint can't be used to discover valid accounts.
    if (!agent) {
      return res.json({ message: 'If that email exists, a reset link has been generated.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.query(
      'INSERT INTO password_resets (agent_id, token, expires_at) VALUES (?, ?, ?)',
      [agent.id, token, expiresAt]
    );

    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password/${token}`;
    console.info(`[password reset] ${email} → ${resetUrl}`);

    res.json({ message: 'If that email exists, a reset link has been generated.', resetUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process the request.' });
  }
}

// POST /api/auth/reset-password  body: { token, password }
export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'token and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const [[reset]] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0',
      [token]
    );
    if (!reset || new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE agents SET password_hash = ? WHERE id = ?', [passwordHash, reset.agent_id]);
    await pool.query('UPDATE password_resets SET used = 1 WHERE id = ?', [reset.id]);

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
}
