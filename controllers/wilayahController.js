const pool = require('../config/database');

exports.getProvinces = async (req, res) => {
  const { rows } = await pool.query('SELECT code, name FROM provinces ORDER BY code');
  res.json({ data: rows });
};

exports.getRegencies = async (req, res) => {
  const { province_code } = req.query;
  const { rows } = await pool.query(
    `
    SELECT r.code, r.name, r.type
    FROM regencies r
    JOIN provinces p ON r.province_id=p.id
    WHERE p.code=$1
    ORDER BY r.code
    `,
    [province_code]
  );
  res.json({ data: rows });
};

exports.getDistricts = async (req, res) => {
  const { regency_code } = req.query;
  const { rows } = await pool.query(
    `
    SELECT d.code, d.name
    FROM districts d
    JOIN regencies r ON d.regency_id=r.id
    WHERE r.code=$1
    ORDER BY d.code
    `,
    [regency_code]
  );
  res.json({ data: rows });
};

exports.getVillages = async (req, res) => {
  const { district_code } = req.query;
  const { rows } = await pool.query(
    `
    SELECT v.code, v.name, v.postal_code
    FROM villages v
    JOIN districts d ON v.district_id=d.id
    WHERE d.code=$1
    ORDER BY v.code
    `,
    [district_code]
  );
  res.json({ data: rows });
};

