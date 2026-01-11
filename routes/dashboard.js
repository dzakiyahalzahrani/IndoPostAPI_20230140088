const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwtAuth = require('../middleware/jwtAuth');
const crypto = require('crypto');

// info user
router.get('/me', jwtAuth, (req, res) => {
  res.json(req.user);
});

router.get('/api-keys', jwtAuth, async (req, res) => {
  const { rows } = await pool.query(
    `
    SELECT id, name, key, is_active, created_at
    FROM api_keys
    WHERE user_id = $1
      AND is_active = true
    ORDER BY created_at DESC
    `,
    [req.user.id]
  );
  res.json(rows);
});


// generate API key
router.post('/api-keys', jwtAuth, async (req, res) => {
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
});

// revoke (soft delete) API key
// revoke API key (soft delete)
router.delete('/api-keys/:id', jwtAuth, async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    UPDATE api_keys
    SET is_active = false
    WHERE id = $1 AND user_id = $2
    RETURNING id
    `,
    [id, req.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'API key tidak ditemukan' });
  }

  res.json({ message: 'API key berhasil dihapus' });
});



module.exports = router;
