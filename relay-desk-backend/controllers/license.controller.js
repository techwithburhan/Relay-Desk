import crypto from 'crypto';
import pool from '../config/db.js';

async function getCurrentLicense() {
  const [[license]] = await pool.query(
    `SELECT * FROM licenses WHERE status = 'active' ORDER BY expires_at DESC LIMIT 1`
  );
  if (!license) return null;
  if (new Date(license.expires_at) < new Date()) {
    await pool.query(`UPDATE licenses SET status = 'expired' WHERE id = ?`, [license.id]);
    return null;
  }
  return license;
}

// Used by the login middleware to block sign-in when no license is active.
export async function hasActiveLicense() {
  return Boolean(await getCurrentLicense());
}

// GET /api/license/status — public (the /license page and login screen both need this)
export async function status(req, res) {
  try {
    const license = await getCurrentLicense();
    if (!license) {
      return res.json({ active: false, message: 'License Expired. Please contact your administrator.' });
    }
    res.json({
      active: true,
      expiresAt: license.expires_at,
      licenseKeyMasked: license.license_key.replace(/.(?=.{4})/g, '•'),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to check license status.' });
  }
}

// POST /api/license/activate  body: { licenseKey }  — public, used on /license page
export async function activate(req, res) {
  const { licenseKey } = req.body;
  if (!licenseKey) return res.status(400).json({ message: 'License key is required.' });

  try {
    const [[license]] = await pool.query('SELECT * FROM licenses WHERE license_key = ?', [licenseKey]);
    if (!license) {
      return res.status(404).json({ message: 'Invalid license key.' });
    }
    if (license.status === 'revoked') {
      return res.status(403).json({ message: 'This license key has been revoked.' });
    }

    // Reactivate/extend: 30 days from now, marked active.
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      `UPDATE licenses SET status = 'active', expires_at = ? WHERE id = ?`,
      [expiresAt, license.id]
    );

    res.json({ message: 'License activated.', expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to activate license.' });
  }
}

// GET /api/license  (admin only) — full history
export async function listLicenses(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM licenses ORDER BY issued_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch licenses.' });
  }
}

// POST /api/license/generate  body: { validityDays }  (admin only)
export async function generate(req, res) {
  const validityDays = Number(req.body.validityDays) || 30;
  const licenseKey = crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');
  const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

  try {
    await pool.query(
      `INSERT INTO licenses (license_key, status, expires_at, created_by) VALUES (?, 'active', ?, ?)`,
      [licenseKey, expiresAt, req.agent.id]
    );
    res.status(201).json({ licenseKey, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate license.' });
  }
}

// POST /api/license/:id/revoke  (admin only)
export async function revoke(req, res) {
  try {
    const [result] = await pool.query(`UPDATE licenses SET status = 'revoked' WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'License not found.' });
    res.json({ message: 'License revoked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to revoke license.' });
  }
}
