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
    await pool.query(`
        CREATE TABLE IF NOT EXISTS lesson_comment_messages (
            id SERIAL PRIMARY KEY,
            lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            author_role VARCHAR(10) NOT NULL CHECK (author_role IN ('student', 'teacher')),
            body TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_lesson_comment_messages_lesson_student
        ON lesson_comment_messages (lesson_id, student_id, created_at);
    `);
}

module.exports = { ensureSchema };
