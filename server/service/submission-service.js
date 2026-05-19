const pool = require('../db');

class SubmissionService {
    async submitAssignment(lessonId, studentId, type, content, items) {
        let storedType = type;
        let storedContent = content || '';

        if (Array.isArray(items) && items.length > 0) {
            const normalized = items
                .map((item) => ({
                    type: item.type,
                    content: String(item.content || '').trim(),
                    label: item.label ? String(item.label).trim() : undefined,
                }))
                .filter(
                    (item) =>
                        item.content &&
                        (item.type === 'link' || item.type === 'file')
                );

            if (normalized.length === 0) {
                const error = new Error('Нет корректных вложений для отправки');
                error.status = 400;
                throw error;
            }

            storedContent = JSON.stringify({ items: normalized });
            const types = new Set(normalized.map((item) => item.type));
            storedType = types.size === 1 ? [...types][0] : 'mixed';
        }

        const newSubmission = await pool.query(
            `INSERT INTO submissions (lesson_id, student_id, type, content) VALUES ($1, $2, $3, $4) RETURNING *`,
            [lessonId, studentId, storedType, storedContent]
        );
        return newSubmission.rows[0];
    }

    async getSubmissionsByLesson(lessonId) {
        const submissions = await pool.query(
            `SELECT s.*, COALESCE(NULLIF(TRIM(u.name), ''), u.email, 'Ученик') AS student_name
             FROM submissions s
             JOIN users u ON u.id = s.student_id
             WHERE s.lesson_id = $1
             ORDER BY s.created_at DESC`,
            [lessonId]
        );
        return submissions.rows;
    }

    async getStudentSubmission(lessonId, studentId) {
        const submission = await pool.query(
            `SELECT * FROM submissions WHERE lesson_id = $1 AND student_id = $2`,
            [lessonId, studentId]
        );
        return submission.rows[0];
    }

    async deleteStudentSubmission(lessonId, studentId) {
        const result = await pool.query(
            `DELETE FROM submissions WHERE lesson_id = $1 AND student_id = $2 RETURNING id`,
            [lessonId, studentId]
        );
        return result.rowCount > 0;
    }
}

module.exports = new SubmissionService();
