const pool = require('../db');
const ApiError = require('../exceptions/api-error');

class CourseReviewService {
    async assertStudentEnrolled(courseId, studentId) {
        const enrollment = await pool.query(
            `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
            [studentId, courseId]
        );
        if (enrollment.rowCount === 0) {
            throw ApiError.BadRequest('Вы не записаны на этот курс');
        }
    }

    async getCourseReviewsSummary(courseId) {
        const { rows } = await pool.query(
            `SELECT
                COUNT(*)::int AS reviews_count,
                COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating
             FROM course_reviews
             WHERE course_id = $1`,
            [courseId]
        );
        return rows[0] || { reviews_count: 0, average_rating: 0 };
    }

    async getCourseReviews(courseId) {
        const summary = await this.getCourseReviewsSummary(courseId);
        const { rows } = await pool.query(
            `SELECT
                r.id,
                r.course_id,
                r.student_id,
                r.rating,
                r.comment,
                r.created_at,
                r.updated_at,
                COALESCE(NULLIF(TRIM(u.name), ''), u.email, 'Студент') AS student_name,
                u.avatar AS student_avatar
             FROM course_reviews r
             JOIN users u ON u.id = r.student_id
             WHERE r.course_id = $1
             ORDER BY r.updated_at DESC`,
            [courseId]
        );
        return { summary, reviews: rows };
    }

    async getMyReview(courseId, studentId) {
        await this.assertStudentEnrolled(courseId, studentId);
        const { rows } = await pool.query(
            `SELECT id, course_id, student_id, rating, comment, created_at, updated_at
             FROM course_reviews
             WHERE course_id = $1 AND student_id = $2`,
            [courseId, studentId]
        );
        return rows[0] || null;
    }

    async upsertMyReview(courseId, studentId, rating, comment) {
        await this.assertStudentEnrolled(courseId, studentId);

        const safeRating = Number(rating);
        if (!Number.isInteger(safeRating) || safeRating < 1 || safeRating > 5) {
            throw ApiError.BadRequest('Оценка должна быть от 1 до 5');
        }

        const safeComment =
            comment == null || String(comment).trim() === ''
                ? null
                : String(comment).trim().slice(0, 2000);

        const { rows } = await pool.query(
            `INSERT INTO course_reviews (course_id, student_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (course_id, student_id)
             DO UPDATE SET
                rating = EXCLUDED.rating,
                comment = EXCLUDED.comment,
                updated_at = NOW()
             RETURNING *`,
            [courseId, studentId, safeRating, safeComment]
        );
        return rows[0];
    }
}

module.exports = new CourseReviewService();
