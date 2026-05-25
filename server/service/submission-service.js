const pool = require('../db');
const ApiError = require('../exceptions/api-error');
const {
    gradeTest,
    parseQuestions,
    isQuestionCorrect,
} = require('../utils/test-grading');
const UserModel = require('../models/user-model');
const mailService = require('./mail-service');

class SubmissionService {
    async submitTest(lessonId, studentId, answers) {
        const existing = await this.getStudentSubmission(lessonId, studentId);
        if (existing) {
            throw ApiError.BadRequest('Тест уже отправлен');
        }

        const lessonResult = await pool.query(
            `SELECT type, content FROM lessons WHERE id = $1`,
            [lessonId]
        );
        const lesson = lessonResult.rows[0];
        if (!lesson || lesson.type !== 'test') {
            throw ApiError.BadRequest('Урок не является тестом');
        }

        let questions;
        try {
            questions = parseQuestions(lesson.content);
        } catch {
            throw ApiError.BadRequest('Некорректное содержимое теста');
        }

        let graded;
        try {
            graded = gradeTest(questions, answers);
        } catch (e) {
            if (e.status === 400) {
                throw ApiError.BadRequest(e.message);
            }
            throw ApiError.BadRequest('Некорректные ответы теста');
        }

        const newSubmission = await pool.query(
            `INSERT INTO submissions (lesson_id, student_id, type, content, review_status)
             VALUES ($1, $2, 'test', $3, 'passed')
             RETURNING *`,
            [lessonId, studentId, graded.storedContent]
        );
        return this._attachOverdue(newSubmission.rows[0], lessonId);
    }

    _buildTestReview(lessonContent, submissionContent) {
        let questions;
        try {
            questions = parseQuestions(lessonContent);
        } catch {
            throw ApiError.BadRequest('Некорректное содержимое теста');
        }

        let parsed;
        try {
            parsed = JSON.parse(submissionContent);
        } catch {
            throw ApiError.BadRequest('Некорректные данные отправки теста');
        }

        if (parsed.kind != null && parsed.kind !== 'test') {
            throw ApiError.BadRequest('Некорректные данные отправки теста');
        }

        const answers = parsed.answers || {};
        const reviewQuestions = questions.map((question) => {
            const qid = String(question.id);
            const selected = (answers[qid] || answers[question.id] || []).map(String);
            const correctOptionIds = (question.options || [])
                .filter(
                    (o) =>
                        o &&
                        (o.isCorrect === true ||
                            o.isCorrect === 'true' ||
                            o.correct === true)
                )
                .map((o) => String(o.id));
            const correct = isQuestionCorrect(question, selected);

            return {
                id: qid,
                text: question.text || '',
                type: question.type === 'multiple' ? 'multiple' : 'single',
                imageUrl: question.imageUrl || null,
                isCorrect: correct,
                selectedOptionIds: selected,
                correctOptionIds,
                options: (question.options || []).map((o) => {
                    const oid = String(o.id);
                    return {
                        id: oid,
                        text: o.text || '',
                        isCorrect: correctOptionIds.includes(oid),
                        wasSelected: selected.includes(oid),
                    };
                }),
            };
        });

        return {
            correctCount: Number(parsed.correctCount) || 0,
            totalCount: Number(parsed.totalCount) || questions.length,
            questions: reviewQuestions,
        };
    }

    async getTestReviewForStudent(lessonId, studentId) {
        const submission = await this.getStudentSubmission(lessonId, studentId);
        if (!submission || submission.type !== 'test') {
            throw ApiError.BadRequest('Тест ещё не сдан');
        }

        const lessonResult = await pool.query(
            `SELECT type, content FROM lessons WHERE id = $1`,
            [lessonId]
        );
        const lesson = lessonResult.rows[0];
        if (!lesson || lesson.type !== 'test') {
            throw ApiError.BadRequest('Урок не является тестом');
        }

        return this._buildTestReview(lesson.content, submission.content);
    }

    async getTestReviewForTeacher(submissionId, teacherId) {
        const result = await pool.query(
            `SELECT s.type, s.content AS submission_content, l.type AS lesson_type, l.content AS lesson_content
             FROM submissions s
             JOIN lessons l ON l.id = s.lesson_id
             JOIN courses c ON c.id = l.course_id
             WHERE s.id = $1 AND c.author_id = $2`,
            [submissionId, teacherId]
        );

        const row = result.rows[0];
        if (!row) {
            throw new ApiError(404, 'Работа не найдена или нет доступа');
        }
        if (row.type !== 'test' || row.lesson_type !== 'test') {
            throw ApiError.BadRequest('Это не тестовая работа');
        }

        return this._buildTestReview(row.lesson_content, row.submission_content);
    }

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
                throw ApiError.BadRequest('Нет корректных вложений для отправки');
            }

            storedContent = JSON.stringify({ items: normalized });
            const types = new Set(normalized.map((item) => item.type));
            storedType = types.size === 1 ? [...types][0] : 'mixed';
        }

        const newSubmission = await pool.query(
            `INSERT INTO submissions (lesson_id, student_id, type, content) VALUES ($1, $2, $3, $4) RETURNING *`,
            [lessonId, studentId, storedType, storedContent]
        );

        const submission = await this._attachOverdue(newSubmission.rows[0], lessonId);
        await this._notifyTeacherAboutAssignmentSubmission(lessonId, studentId);
        return submission;
    }

    async _notifyTeacherAboutAssignmentSubmission(lessonId, studentId) {
        try {
            const lessonResult = await pool.query(
                `SELECT l.title, l.type, l.course_id, c.author_id
                 FROM lessons l
                 JOIN courses c ON c.id = l.course_id
                 WHERE l.id = $1`,
                [lessonId]
            );
            const lesson = lessonResult.rows[0];
            if (!lesson || lesson.type !== 'assignment' || !lesson.author_id) {
                return;
            }

            const student = await UserModel.findById(studentId);
            const studentName =
                (student?.name && String(student.name).trim()) ||
                student?.email ||
                'Студент';

            const notificationService = require('./notification-service');
            await notificationService.createAssignmentSubmittedNotification(lesson.author_id, {
                studentName,
                lessonTitle: lesson.title,
                courseId: lesson.course_id,
                lessonId: Number(lessonId),
            });
        } catch (e) {
            console.error('Failed to create assignment submission notification:', e);
        }
    }

    async _attachOverdue(submission, lessonId) {
        if (!submission) return submission;
        const lesson = await pool.query(`SELECT deadline FROM lessons WHERE id = $1`, [lessonId]);
        const deadline = lesson.rows[0]?.deadline;
        return {
            ...submission,
            is_overdue: !!(
                deadline &&
                submission.created_at &&
                new Date(submission.created_at) > new Date(deadline)
            ),
        };
    }

    async getSubmissionsByLesson(lessonId) {
        const submissions = await pool.query(
            `SELECT s.*,
                    COALESCE(NULLIF(TRIM(u.name), ''), u.email, 'Ученик') AS student_name,
                    (l.deadline IS NOT NULL AND s.created_at > l.deadline) AS is_overdue
             FROM submissions s
             JOIN users u ON u.id = s.student_id
             JOIN lessons l ON l.id = s.lesson_id
             WHERE s.lesson_id = $1
             ORDER BY s.created_at DESC`,
            [lessonId]
        );
        return submissions.rows;
    }

    async getStudentSubmission(lessonId, studentId) {
        const submission = await pool.query(
            `SELECT s.*,
                    (l.deadline IS NOT NULL AND s.created_at > l.deadline) AS is_overdue
             FROM submissions s
             JOIN lessons l ON l.id = s.lesson_id
             WHERE s.lesson_id = $1 AND s.student_id = $2`,
            [lessonId, studentId]
        );
        return submission.rows[0];
    }

    async deleteStudentSubmission(lessonId, studentId) {
        const lesson = await pool.query(
            `SELECT type FROM lessons WHERE id = $1`,
            [lessonId]
        );
        if (lesson.rows[0]?.type === 'test') {
            throw ApiError.BadRequest('Отмена сдачи теста недоступна');
        }

        const result = await pool.query(
            `DELETE FROM submissions WHERE lesson_id = $1 AND student_id = $2 RETURNING id`,
            [lessonId, studentId]
        );
        return result.rowCount > 0;
    }

    async getStudentCourseGrades(courseId, studentId) {
        const enrollment = await pool.query(
            `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
            [studentId, courseId]
        );
        if (enrollment.rowCount === 0) {
            throw ApiError.BadRequest('Вы не записаны на этот курс');
        }

        const { rows } = await pool.query(
            `SELECT
                l.id AS lesson_id,
                l.title AS lesson_title,
                l.type AS lesson_type,
                s.id AS submission_id,
                s.review_status,
                s.created_at AS submitted_at,
                (l.deadline IS NOT NULL AND s.created_at > l.deadline) AS is_overdue
             FROM lessons l
             LEFT JOIN submissions s
                ON s.lesson_id = l.id AND s.student_id = $2
             WHERE l.course_id = $1
               AND l.type IN ('assignment', 'test')
             ORDER BY l.id ASC`,
            [courseId, studentId]
        );
        return rows;
    }

    async updateReviewStatus(submissionId, teacherId, status) {
        const allowed = ['passed', 'failed'];
        if (!allowed.includes(status)) {
            throw ApiError.BadRequest('Недопустимый статус проверки');
        }

        const result = await pool.query(
            `UPDATE submissions s
             SET review_status = $1
             FROM lessons l
             JOIN courses c ON c.id = l.course_id
             WHERE s.id = $2
               AND s.lesson_id = l.id
               AND c.author_id = $3
             RETURNING s.*`,
            [status, submissionId, teacherId]
        );

        if (result.rowCount === 0) {
            throw new ApiError(404, 'Работа не найдена или нет доступа');
        }

        const submission = result.rows[0];
        const lessonResult = await pool.query(
            `SELECT title, course_id FROM lessons WHERE id = $1`,
            [submission.lesson_id]
        );
        const lesson = lessonResult.rows[0];
        if (lesson) {
            const statusLabel = status === 'passed' ? 'Сдал' : 'Не сдал';
            const notificationService = require('./notification-service');
            await notificationService.createSubmissionReviewNotification(submission.student_id, {
                lessonId: submission.lesson_id,
                lessonTitle: lesson.title,
                status,
                courseId: lesson.course_id,
            });

            try {
                const student = await UserModel.findById(submission.student_id);
                if (student?.email) {
                    const clientBase = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
                    const lessonUrl = `${clientBase}/student/lesson/${submission.lesson_id}`;
                    await mailService.sendSubmissionReviewMail(student.email, {
                        lessonTitle: lesson.title,
                        statusLabel,
                        lessonUrl,
                    });
                }
            } catch (e) {
                console.error('Failed to send submission review email:', e);
            }
        }

        return submission;
    }
}

module.exports = new SubmissionService();
