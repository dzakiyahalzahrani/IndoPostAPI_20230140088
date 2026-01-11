const pool = require('../config/database');

module.exports = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;

    pool.query(
      `
      INSERT INTO request_logs
      (api_key_id, endpoint, method, status_code, response_time, ip_address, user_agent)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        req.apiKey?.id || null,
        req.originalUrl,
        req.method,
        res.statusCode,
        responseTime,
        req.ip,
        req.headers['user-agent']
      ]
    ).catch(() => {});
  });

  next();
};
