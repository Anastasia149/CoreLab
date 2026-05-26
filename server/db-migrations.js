const pool = require('./db');

async function ensureSchema() {
    await pool.query(`
        ALTER TABLE courses
        ADD COLUMN IF NOT EXISTS category VARCHAR(255);
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS course_reports (
            id SERIAL PRIMARY KEY,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            reason TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

module.exports = { ensureSchema };
