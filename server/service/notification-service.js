const pool = require('../db');

let tableReady = false;

/** Таблица notifications уже в БД — только добиваем колонки, если их не было в старой схеме. */
async function ensureNotificationsTable() {
    if (tableReady) return;

    await pool.query(`
        ALTER TABLE notifications
        ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL
    `);
    await pool.query(`
        ALTER TABLE notifications
        ADD COLUMN IF NOT EXISTS lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL
    `);

    tableReady = true;
}

function reviewStatusLabel(status) {
    return status === 'passed' ? 'Сдал' : 'Не сдал';
}

class NotificationService {
    async createEnrollmentNotification(teacherId, { studentName, courseTitle, courseId }) {
        await ensureNotificationsTable();
        const message = `Студент ${studentName} записался на курс «${courseTitle}».`;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, message, course_id)
             VALUES ($1, 'enrollment', $2, $3)
             RETURNING *`,
            [teacherId, message, courseId]
        );
        return result.rows[0];
    }

    async createAssignmentSubmittedNotification(teacherId, { studentName, lessonTitle, courseId, lessonId }) {
        await ensureNotificationsTable();
        const message = `Студент ${studentName} отправил домашнее задание по уроку «${lessonTitle}».`;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, message, course_id, lesson_id)
             VALUES ($1, 'assignment_submitted', $2, $3, $4)
             RETURNING *`,
            [teacherId, message, courseId ?? null, lessonId]
        );
        return result.rows[0];
    }

    async createLessonCommentStudentNotification(teacherId, { studentName, lessonTitle, courseId, lessonId }) {
        await ensureNotificationsTable();
        const message = `Студент ${studentName} оставил комментарий к уроку «${lessonTitle}».`;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, message, course_id, lesson_id)
             VALUES ($1, 'lesson_comment_student', $2, $3, $4)
             RETURNING *`,
            [teacherId, message, courseId ?? null, lessonId]
        );
        return result.rows[0];
    }

    async createLessonCommentTeacherNotification(studentId, { lessonTitle, courseId, lessonId }) {
        await ensureNotificationsTable();
        const message = `Преподаватель ответил на ваш комментарий к уроку «${lessonTitle}».`;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, message, course_id, lesson_id)
             VALUES ($1, 'lesson_comment_teacher', $2, $3, $4)
             RETURNING *`,
            [studentId, message, courseId ?? null, lessonId]
        );
        return result.rows[0];
    }

    async createSubmissionReviewNotification(studentId, { lessonId, lessonTitle, status, courseId }) {
        await ensureNotificationsTable();
        const label = reviewStatusLabel(status);
        const message = `Ваша работа по уроку «${lessonTitle}» проверена: ${label}.`;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, message, course_id, lesson_id)
             VALUES ($1, 'submission_review', $2, $3, $4)
             RETURNING *`,
            [studentId, message, courseId ?? null, lessonId]
        );
        return result.rows[0];
    }

    async listForUser(userId, limit = 50) {
        await ensureNotificationsTable();
        const result = await pool.query(
            `SELECT id, type, message, course_id, lesson_id, is_read, created_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        const unreadResult = await pool.query(
            `SELECT COUNT(*)::int AS count
             FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        return {
            items: result.rows,
            unreadCount: unreadResult.rows[0]?.count ?? 0,
        };
    }

    async deleteAllForUser(userId) {
        await ensureNotificationsTable();
        await pool.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);
        return { unreadCount: 0 };
    }

    async deleteById(userId, notificationId) {
        await ensureNotificationsTable();
        const result = await pool.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
            [notificationId, userId]
        );
        if (result.rowCount === 0) {
            const ApiError = require('../exceptions/api-error');
            throw ApiError.BadRequest('Уведомление не найдено');
        }
        return true;
    }
}

module.exports = new NotificationService();
