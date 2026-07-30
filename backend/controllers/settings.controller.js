import pool from '../config/db.js';

// GET /api/settings  — any logged-in user can read (needed for login-page branding, etc.)
export async function getSettings(req, res) {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM app_settings');
    const settings = {};
    rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch settings.' });
  }
}

// PUT /api/settings  (admin only, enforced in routes)  body: { key: value, ... }
export async function updateSettings(req, res) {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ message: 'Body must be a { key: value } object.' });
  }

  try {
    const entries = Object.entries(updates);
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, String(value)]
      );
    }
    res.json({ message: 'Settings updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update settings.' });
  }
}
