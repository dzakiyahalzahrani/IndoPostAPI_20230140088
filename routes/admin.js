const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// ⬇️ AMBIL POOL DARI app.js (POSTGRES)
const pool = require("../config/database");


/* ================= USERS ================= */
router.get("/users", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.organization,
        u.email,
        COUNT(k.id) AS api_key_count
      FROM users u
      LEFT JOIN api_keys k ON k.user_id = u.id
      GROUP BY u.id, u.full_name, u.organization, u.email
      ORDER BY u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err);
    res.json([]);
  }
});

/* ===== UPDATE USER ===== */
router.put("/users/:id", async (req, res) => {
  const { nama, instansi, email } = req.body;
  try {
    await pool.query(
      `UPDATE users
       SET full_name = $1, organization = $2, email = $3
       WHERE id = $4`,
      [nama, instansi, email, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);
    res.status(500).json({ error: "update failed" });
  }
});

/* ===== DELETE USER ===== */
router.delete("/users/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ error: "delete failed" });
  }
});


/* ================= API KEY (GENERATE) ================= */
router.post("/apikey", async (req, res) => {
  try {
    const { user_id } = req.body;
    const apiKey = crypto.randomBytes(32).toString("hex");

    await pool.query(
      `INSERT INTO api_keys (user_id, key, name)
       VALUES ($1, $2, 'Default Key')`,
      [user_id, apiKey]
    );

    res.json({ api_key: apiKey });
  } catch (err) {
    console.error("CREATE API KEY ERROR:", err);
    res.status(500).json({ error: "failed to create api key" });
  }
});

/* ================= API KEY PER USER ================= */
router.get("/apikey/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, key, name, is_active, usage_count, last_used_at
       FROM api_keys
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET USER API KEY ERROR:", err);
    res.json([]);
  }
});

router.put("/apikey/:id/name", async (req, res) => {
  try {
    await pool.query(
      "UPDATE api_keys SET name = $1 WHERE id = $2",
      [req.body.name, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("UPDATE API KEY NAME ERROR:", err);
    res.status(500).json({ error: "update failed" });
  }
});

router.patch("/apikey/:id/toggle", async (req, res) => {
  try {
    await pool.query(
      "UPDATE api_keys SET is_active = NOT is_active WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("TOGGLE API KEY ERROR:", err);
    res.status(500).json({ error: "toggle failed" });
  }
});

router.delete("/apikey/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM api_keys WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE API KEY ERROR:", err);
    res.status(500).json({ error: "delete failed" });
  }
});

/* ================= API KEYS (ADMIN VIEW) ================= */
router.get("/apikeys", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        ak.id,
        u.email,
        ak."key",
        ak.is_active,
        ak.usage_count,
        ak.last_used_at
      FROM api_keys ak
      JOIN users u ON u.id = ak.user_id
      ORDER BY ak.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("ADMIN API KEYS ERROR:", err);
    res.status(500).json([]);
  }
});

/* ================= HISTORY ================= */
router.get("/history", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        r.id,
        u.email,
        r.endpoint,
        r.created_at
      FROM request_logs r
      LEFT JOIN api_keys k ON r.api_key_id = k.id
      LEFT JOIN users u ON k.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.json([]);
  }
});

router.delete("/history/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM request_logs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE HISTORY ERROR:", err);
    res.status(500).json({ error: "delete failed" });
  }
});

module.exports = router;
