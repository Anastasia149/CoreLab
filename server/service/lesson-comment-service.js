const pool = require('../db');
const ApiError = require('../exceptions/api-error');
const UserModel = require('../models/user-model');

const MAX_BODY_LENGTH = 2000;

function trimBody(body) {
    const text = String(body ?? '').trim();
    if (!text) {
        throw ApiError.BadRequest('Текст комментария не может быть пустым');
    }
    if (text.length > MAX_BODY_LENGTH) {
        throw ApiError.BadRequest(`Комментарий не длиннее ${MAX_BODY_LENGTH} символов`);
    }
    return text;
}

class LessonCommentService {
    async _getLessonForUser(lessonId, userId, role) {
        const result = await pool.query(
            `SELECT l.id, l.title, l.type, l.course_id, c.author_id
             FROM lessons l
             JOIN courses c ON c.id = l.course_id
             WHERE l.id = $1`,
            [lessonId]
        );
        const lesson = result.rows[0];
        if (!lesson) {
            throw ApiError.BadRequest('Урок не найден');
        }

        if (role === 'teacher') {
            if (Number(lesson.author_id) !== Number(userId)) {
                throw new ApiError(404, 'Урок не найден или нет доступа');
            }
            return lesson;
        }

        const enrollment = await pool.query(
            `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
            [userId, lesson.course_id]
        );
        if (enrollment.rowCount === 0) {
            throw ApiError.BadRequest('Вы не записаны на этот курс');
        }
        return lesson;
    }

    _mapMessage(row) {
        return {
            id: row.id,
            lessonId: row.lesson_id,
            studentId: row.student_id,
            authorRole: row.author_role,
            body: row.body,
            createdAt: row.created_at,
        };
    }

    async getMyThread(lessonId, studentId) {
        await this._getLessonForUser(lessonId, studentId, 'student');
        const { rows } = await pool.query(
            `SELECT id, lesson_id, student_id, author_role, body, created_at
             FROM lesson_comment_messages
             WHERE lesson_id = $1 AND student_id = $2
             ORDER BY created_at ASC`,
            [lessonId, studentId]
        );
        return { messages: rows.map((row) => this._mapMessage(row)) };
    }

    async postStudentMessage(lessonId, studentId, body) {
        const lesson = await this._getLessonForUser(lessonId, studentId, 'student');
        const safeBody = trimBody(body);

        const result = await pool.query(
            `INSERT INTO lesson_comment_messages (lesson_id, student_id, author_role, body)
             VALUES ($1, $2, 'student', $3)
             RETURNING id, lesson_id, student_id, author_role, body, created_at`,
            [lessonId, studentId, safeBody]
        );
        const message = this._mapMessage(result.rows[0]);

        await this._notifyTeacherAboutStudentComment(lesson, studentId);

        return message;
    }

    async getLessonThreads(lessonId, teacherId) {
        await this._getLessonForUser(lessonId, teacherId, 'teacher');

        const { rows } = await pool.query(
            `SELECT m.id, m.lesson_id, m.student_id, m.author_role, m.body, m.created_at,
                    COALESCE(NULLIF(TRIM(u.name), ''), u.email, 'Ученик') AS student_name
             FROM lesson_comment_messages m
             JOIN users u ON u.id = m.student_id
             WHERE m.lesson_id = $1
             ORDER BY m.student_id ASC, m.created_at ASC`,
            [lessonId]
        );

        const threadsMap = new Map();
        for (const row of rows) {
            const sid = row.student_id;
            if (!threadsMap.has(sid)) {
                threadsMap.set(sid, {
                    studentId: sid,
                    studentName: row.student_name,
                    messages: [],
                });
            }
            threadsMap.get(sid).messages.push(this._mapMessage(row));
        }

        return {
            threads: [...threadsMap.values()].sort((a, b) => {
                const aLast = a.messages[a.messages.length - 1]?.createdAt ?? '';
                const bLast = b.messages[b.messages.length - 1]?.createdAt ?? '';
                return new Date(bLast).getTime() - new Date(aLast).getTime();
            }),
        };
    }

    async postTeacherReply(lessonId, teacherId, studentId, body) {
        const lesson = await this._getLessonForUser(lessonId, teacherId, 'teacher');
        const safeBody = trimBody(body);
        const targetStudentId = Number(studentId);
        if (!Number.isFinite(targetStudentId) || targetStudentId <= 0) {
            throw ApiError.BadRequest('Некорректный студент');
        }

        const threadCheck = await pool.query(
            `SELECT 1 FROM lesson_comment_messages
             WHERE lesson_id = $1 AND student_id = $2 AND author_role = 'student'
             LIMIT 1`,
            [lessonId, targetStudentId]
        );
        if (threadCheck.rowCount === 0) {
            throw ApiError.BadRequest('У этого ученика ещё нет комментария к уроку');
        }

        const enrollment = await pool.query(
            `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
            [targetStudentId, lesson.course_id]
        );
        if (enrollment.rowCount === 0) {
            throw ApiError.BadRequest('Ученик не записан на курс');
        }

        const result = await pool.query(
            `INSERT INTO lesson_comment_messages (lesson_id, student_id, author_role, body)
             VALUES ($1, $2, 'teacher', $3)
             RETURNING id, lesson_id, student_id, author_role, body, created_at`,
            [lessonId, targetStudentId, safeBody]
        );
        const message = this._mapMessage(result.rows[0]);

        await this._notifyStudentAboutTeacherReply(lesson, targetStudentId);

        return message;
    }

    async deleteMessage(lessonId, messageId, userId, role) {
        const msgResult = await pool.query(
            `SELECT id, lesson_id, student_id, author_role
             FROM lesson_comment_messages
             WHERE id = $1 AND lesson_id = $2`,
            [messageId, lessonId]
        );
        const msg = msgResult.rows[0];
        if (!msg) {
            throw new ApiError(404, 'Сообщение не найдено');
        }

        if (role === 'teacher') {
            await this._getLessonForUser(lessonId, userId, 'teacher');
        } else {
            await this._getLessonForUser(lessonId, userId, 'student');
            if (msg.author_role !== 'student' || Number(msg.student_id) !== Number(userId)) {
                throw ApiError.BadRequest('Нельзя удалить это сообщение');
            }
        }

        await pool.query(`DELETE FROM lesson_comment_messages WHERE id = $1`, [messageId]);
        return true;
    }

    async _notifyTeacherAboutStudentComment(lesson, studentId) {
        try {
            if (!lesson.author_id) return;

            const student = await UserModel.findById(studentId);
            const studentName =
                (student?.name && String(student.name).trim()) ||
                student?.email ||
                'Студент';

            const notificationService = require('./notification-service');
            await notificationService.createLessonCommentStudentNotification(lesson.author_id, {
                studentName,
                lessonTitle: lesson.title,
                courseId: lesson.course_id,
                lessonId: lesson.id,
            });
        } catch (e) {
            console.error('Failed to create student comment notification:', e);
        }
    }

    async _notifyStudentAboutTeacherReply(lesson, studentId) {
        try {
            const notificationService = require('./notification-service');
            await notificationService.createLessonCommentTeacherNotification(studentId, {
                lessonTitle: lesson.title,
                courseId: lesson.course_id,
                lessonId: lesson.id,
            });
        } catch (e) {
            console.error('Failed to create teacher reply notification:', e);
        }
    }
}

module.exports = new LessonCommentService();
