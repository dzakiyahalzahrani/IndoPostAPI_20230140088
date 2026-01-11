const pool = require('../config/database');

module.exports = async function apiKeyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'API Key missing' });
  }

  const key = authHeader.split(' ')[1];
  if (!key) {
    return res.status(401).json({ message: 'API Key missing' });
  }

  try {
    const result = await pool.query(
      `
      SELECT id, user_id
      FROM api_keys
      WHERE key = $1 AND is_active = true
      `,
      [key]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ message: 'Invalid API Key' });
    }

    // simpan info kalau nanti mau dipakai (usage, logging, dll)
    req.apiKey = result.rows[0];
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'API Key validation failed' });
  }
};
