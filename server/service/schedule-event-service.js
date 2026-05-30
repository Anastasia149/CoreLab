const pool = require('../db');
const ApiError = require('../exceptions/api-error');

const ALLOWED_TYPES = new Set(['task', 'reminder', 'event']);

function formatDateKey(value) {
    if (!value) return '';
    if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return String(value).slice(0, 10);
}

function formatTime(value) {
    if (!value) return '';
    return String(value).slice(0, 5);
}

function timeToMinutes(time) {
    const [h, m] = String(time).split(':').map(Number);
    return h * 60 + (m || 0);
}

function mapRow(row) {
    return {
        id: String(row.id),
        type: row.type,
        courseId: Number(row.course_id),
        courseTitle: row.course_title,
        title: row.title,
        date: formatDateKey(row.event_date),
        startTime: formatTime(row.start_time),
        endTime: formatTime(row.end_time),
        description: row.description || '',
    };
}

class ScheduleEventService {
    async assertUserCanUseCourse(userId, role, courseId) {
        const safeCourseId = Number(courseId);
        if (!Number.isFinite(safeCourseId)) {
            throw ApiError.BadRequest('Некорректный курс');
        }

        if (role === 'teacher') {
            const { rowCount } = await pool.query(
                'SELECT 1 FROM courses WHERE id = $1 AND author_id = $2',
                [safeCourseId, userId]
            );
            if (!rowCount) {
                throw ApiError.BadRequest('Курс не найден');
            }
            return safeCourseId;
        }

        if (role === 'student') {
            const { rowCount } = await pool.query(
                'SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2',
                [userId, safeCourseId]
            );
            if (!rowCount) {
                throw ApiError.BadRequest('Вы не записаны на этот курс');
            }
            return safeCourseId;
        }

        throw ApiError.Forbidden();
    }

    validatePayload({ type, title, date, startTime, endTime, description }) {
        if (!ALLOWED_TYPES.has(type)) {
            throw ApiError.BadRequest('Некорректный тип события');
        }
        const safeTitle = String(title || '').trim();
        if (!safeTitle) {
            throw ApiError.BadRequest('Укажите название события');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw ApiError.BadRequest('Некорректная дата');
        }
        if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
            throw ApiError.BadRequest('Некорректное время');
        }
        if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
            throw ApiError.BadRequest('Время окончания должно быть позже времени начала');
        }
        return {
            safeTitle: safeTitle.slice(0, 200),
            safeDescription: String(description || '').trim().slice(0, 2000),
        };
    }

    async listForUser(userId) {
        const { rows } = await pool.query(
            `SELECT e.*, c.title AS course_title
             FROM schedule_events e
             JOIN courses c ON c.id = e.course_id
             WHERE e.user_id = $1
             ORDER BY e.event_date ASC, e.start_time ASC`,
            [userId]
        );
        return rows.map(mapRow);
    }

    async createEvent(userId, role, payload) {
        const courseId = await this.assertUserCanUseCourse(userId, role, payload.courseId);
        const { safeTitle, safeDescription } = this.validatePayload({
            type: payload.type,
            title: payload.title,
            date: payload.date,
            startTime: payload.startTime,
            endTime: payload.endTime,
            description: payload.description,
        });

        const { rows } = await pool.query(
            `INSERT INTO schedule_events (
                user_id, course_id, type, title, event_date, start_time, end_time, description
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, user_id, course_id, type, title, event_date, start_time, end_time, description`,
            [
                userId,
                courseId,
                payload.type,
                safeTitle,
                payload.date,
                payload.startTime,
                payload.endTime,
                safeDescription || null,
            ]
        );

        const courseTitleRow = await pool.query(
            'SELECT title FROM courses WHERE id = $1',
            [courseId]
        );

        return mapRow({
            ...rows[0],
            course_title: courseTitleRow.rows[0]?.title || '',
        });
    }

    async importFromClient(userId, role, events) {
        if (!Array.isArray(events) || events.length === 0) {
            return [];
        }

        const existing = await this.listForUser(userId);
        if (existing.length > 0) {
            return existing;
        }

        const created = [];
        for (const raw of events) {
            try {
                const ev = await this.createEvent(userId, role, {
                    type: raw.type,
                    courseId: raw.courseId,
                    title: raw.title,
                    date: raw.date,
                    startTime: raw.startTime,
                    endTime: raw.endTime,
                    description: raw.description,
                });
                created.push(ev);
            } catch {
                // пропускаем невалидные записи при миграции
            }
        }
        return created.length ? await this.listForUser(userId) : [];
    }

    async updateEvent(userId, role, eventId, payload) {
        const safeId = Number(eventId);
        if (!Number.isFinite(safeId)) {
            throw ApiError.BadRequest('Некорректный id события');
        }

        const { rowCount } = await pool.query(
            'SELECT 1 FROM schedule_events WHERE id = $1 AND user_id = $2',
            [safeId, userId]
        );
        if (!rowCount) {
            throw ApiError.NotFound('Событие не найдено');
        }

        const courseId = await this.assertUserCanUseCourse(userId, role, payload.courseId);
        const { safeTitle, safeDescription } = this.validatePayload({
            type: payload.type,
            title: payload.title,
            date: payload.date,
            startTime: payload.startTime,
            endTime: payload.endTime,
            description: payload.description,
        });

        const { rows } = await pool.query(
            `UPDATE schedule_events
             SET course_id = $1, type = $2, title = $3, event_date = $4,
                 start_time = $5, end_time = $6, description = $7
             WHERE id = $8 AND user_id = $9
             RETURNING id, user_id, course_id, type, title, event_date, start_time, end_time, description`,
            [
                courseId,
                payload.type,
                safeTitle,
                payload.date,
                payload.startTime,
                payload.endTime,
                safeDescription || null,
                safeId,
                userId,
            ]
        );

        const courseTitleRow = await pool.query(
            'SELECT title FROM courses WHERE id = $1',
            [courseId]
        );

        return mapRow({
            ...rows[0],
            course_title: courseTitleRow.rows[0]?.title || '',
        });
    }

    async deleteEvent(userId, eventId) {
        const safeId = Number(eventId);
        if (!Number.isFinite(safeId)) {
            throw ApiError.BadRequest('Некорректный id события');
        }

        const { rowCount } = await pool.query(
            'DELETE FROM schedule_events WHERE id = $1 AND user_id = $2',
            [safeId, userId]
        );
        if (!rowCount) {
            throw ApiError.NotFound('Событие не найдено');
        }
    }
}

module.exports = new ScheduleEventService();
