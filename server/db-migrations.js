const pool = require('./db');

async function ensureSchema() {
    await pool.query(`
        ALTER TABLE courses
        ADD COLUMN IF NOT EXISTS category VARCHAR(255);
    `);
}

module.exports = { ensureSchema };
