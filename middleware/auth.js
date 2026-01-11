const pool = require('../config/database');

module.exports = async function apiKeyAuth(req, res, next) {
  try {
    const apiKey = req.header('x-api-key');

    // 1. cek header
    if (!apiKey) {
      return res.status(401).json({
        error: 'API_KEY_REQUIRED',
        message: 'x-api-key header is required'
      });
    }

    // 2. validasi api key
    const result = await pool.query(
      `
      SELECT 
        ak.id AS api_key_id,
        ak.key,
        ak.is_active,
        u.id AS user_id,
        u.email,
        u.role
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.key = $1
      LIMIT 1
      `,
      [apiKey]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'INVALID_API_KEY',
        message: 'API key not found'
      });
    }

    const data = result.rows[0];

    // 3. cek status
    if (!data.is_active) {
      return res.status(403).json({
        error: 'API_KEY_DISABLED',
        message: 'API key is disabled'
      });
    }

    // 4. inject ke request
    req.apiKey = {
      id: data.api_key_id,
      key: data.key
    };

    req.user = {
      id: data.user_id,
      email: data.email,
      role: data.role
    };

    // 5. update usage (non-blocking)
    pool.query(
      `
      UPDATE api_keys
      SET usage_count = usage_count + 1,
          last_used_at = NOW()
      WHERE id = $1
      `,
      [data.api_key_id]
    ).catch(() => {});

    next();
  } catch (err) {
    console.error('API Key Auth Error:', err);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};
