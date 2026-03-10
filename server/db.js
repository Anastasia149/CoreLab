const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL,
  client_encoding: 'UTF8',
});

module.exports = pool;
