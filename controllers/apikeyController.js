const pool = require('../config/database');
const crypto = require('crypto');

// GET list API key user
exports.getApiKeys = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT id, name, key, is_active, created_at, usage_count
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch API keys' });
  }
};


// POST generate API key
exports.createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    const key = crypto.randomBytes(32).toString('hex');

    await pool.query(
      `
      INSERT INTO api_keys (user_id, key, name)
      VALUES ($1,$2,$3)
      `,
      [req.user.id, key, name || 'Default Key']
    );

    res.status(201).json({ api_key: key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate API key' });
  }
};

// PATCH revoke API key
exports.revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE api_keys
      SET is_active = false
      WHERE id = $1 AND user_id = $2
      `,
      [id, req.user.id]
    );

    res.json({ message: 'API key revoked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to revoke API key' });
  }
};
