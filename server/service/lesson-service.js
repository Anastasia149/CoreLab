const pool = require('../db');
const fileService = require('./file-service');
const { decodeMultipartFilename } = require('../utils/multipart-text');
const { normalizeTestContentForCompare } = require('../utils/test-grading');
const ApiError = require('../exceptions/api-error');

function deadlineValue(deadline) {
    if (deadline == null || deadline === '') return '';
    return String(new Date(deadline).getTime());
}

function testLessonFieldsChanged(existing, update) {
    if (existing.title !== update.title) return true;
    if (String(existing.module_id ?? '') !== String(update.moduleId ?? '')) {
        return true;
    }
    if ((existing.image_url || null) !== (update.imageUrl || null)) return true;
    if (existing.type !== update.type) return true;
    if (deadlineValue(existing.deadline) !== deadlineValue(update.deadline)) {
        return true;
    }
    return (
        normalizeTestContentForCompare(existing.content) !==
        normalizeTestContentForCompare(update.content)
    );
}

async function resetTestSubmissions(lessonId) {
    const result = await pool.query(
        `DELETE FROM submissions WHERE lesson_id = $1`,
        [lessonId]
    );
    return result.rowCount;
}

function assertDeadlineNotInPast(deadline, existingDeadline = null) {
    if (deadline == null || deadline === '') return;

    const next = new Date(deadline).getTime();
    if (Number.isNaN(next)) {
        throw ApiError.BadRequest('Некорректный срок сдачи');
    }

    if (existingDeadline != null && existingDeadline !== '') {
        const prev = new Date(existingDeadline).getTime();
        if (!Number.isNaN(prev) && prev === next) return;
    }

    if (next < Date.now()) {
        throw ApiError.BadRequest('Срок сдачи не может быть раньше текущего времени');
    }
}

class LessonService {
    async createLesson(courseId, moduleId, title, content, imageUrl, type = 'lecture', deadline = null) {
        assertDeadlineNotInPast(deadline);

        const newLesson = await pool.query(
            `INSERT INTO lessons (course_id, module_id, title, content, image_url, type, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [courseId, moduleId, title, content, imageUrl, type, deadline]
        );
        return newLesson.rows[0];
    }

    async updateLesson(lessonId, title, content, moduleId, imageUrl, type = 'lecture', deadline = null) {
        console.log("lesson-service.updateLesson called with:", { lessonId, title, content, moduleId, imageUrl, type, deadline });

        const existingResult = await pool.query(
            `SELECT type, title, content, module_id, image_url, deadline FROM lessons WHERE id = $1`,
            [lessonId]
        );
        const existing = existingResult.rows[0];
        if (!existing) {
            throw ApiError.BadRequest('Урок не найден');
        }

        assertDeadlineNotInPast(deadline, existing.deadline);

        const shouldResetTestSubmissions =
            existing.type === 'test' &&
            testLessonFieldsChanged(existing, {
                title,
                content,
                moduleId,
                imageUrl,
                type,
                deadline,
            });

        const updatedLesson = await pool.query(
            `UPDATE lessons SET title = $1, content = $2, module_id = $3, image_url = $4, type = $5, deadline = $6 WHERE id = $7 RETURNING *`,
            [title, content, moduleId, imageUrl, type, deadline, lessonId]
        );
        console.log("Updated lesson from DB:", updatedLesson.rows[0]);

        let testSubmissionsReset = 0;
        if (shouldResetTestSubmissions) {
            testSubmissionsReset = await resetTestSubmissions(lessonId);
        }

        return {
            ...updatedLesson.rows[0],
            testSubmissionsReset,
        };
    }

    async createLessonMaterial(lessonId, file) {
        const lessonRow = await pool.query(
            `SELECT type FROM lessons WHERE id = $1`,
            [lessonId]
        );
        const lessonType = lessonRow.rows[0]?.type;

        const fileName = fileService.saveFile(file);
        const fileUrl = `${process.env.API_URL}/${fileName}`;
        
        let type = 'file'; // default type
        const mimeType = file.mimetype;
        const mimeTypeMain = mimeType.split('/')[0];

        if (mimeTypeMain === 'image') {
            type = 'image';
        } else if (mimeTypeMain === 'video') {
            type = 'video';
        } else if (
            mimeType === 'application/pdf' || 
            mimeType.includes('word') || 
            mimeType.includes('presentation') || 
            mimeType.includes('sheet') ||
            mimeType.includes('document')
        ) {
            type = 'document';
        }

        const newMaterial = await pool.query(
            `INSERT INTO lesson_materials (lesson_id, type, title, file_url) VALUES ($1, $2, $3, $4) RETURNING *`,
            [lessonId, type, decodeMultipartFilename(file.name), fileUrl]
        );

        let testSubmissionsReset = 0;
        if (lessonType === 'test') {
            testSubmissionsReset = await resetTestSubmissions(lessonId);
        }

        return {
            ...newMaterial.rows[0],
            testSubmissionsReset,
        };
    }

    async getLessonById(lessonId) {
        const query = `
            SELECT 
                l.*,
                MAX(u.name) AS author_name,
                MAX(COALESCE(c.students_count, 0))::int AS students_count,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', ma.id,
                            'type', ma.type,
                            'title', ma.title,
                            'file_url', ma.file_url
                        )
                    ) FILTER (WHERE ma.id IS NOT NULL), '[]'::json
                ) as materials
            FROM lessons l
            JOIN courses c ON c.id = l.course_id
            JOIN users u ON u.id = c.author_id
            LEFT JOIN lesson_materials ma ON ma.lesson_id = l.id
            WHERE l.id = $1
            GROUP BY l.id;
        `;
        const { rows } = await pool.query(query, [lessonId]);
        return rows[0];
    }

    async deleteLessonMaterial(materialId) {
        const materialRow = await pool.query(
            `SELECT lesson_id FROM lesson_materials WHERE id = $1`,
            [materialId]
        );
        const lessonId = materialRow.rows[0]?.lesson_id;

        await pool.query(`DELETE FROM lesson_materials WHERE id = $1`, [materialId]);

        if (!lessonId) return { testSubmissionsReset: 0 };

        const lessonRow = await pool.query(
            `SELECT type FROM lessons WHERE id = $1`,
            [lessonId]
        );
        if (lessonRow.rows[0]?.type !== 'test') {
            return { testSubmissionsReset: 0 };
        }

        const testSubmissionsReset = await resetTestSubmissions(lessonId);
        return { testSubmissionsReset };
    }

    async deleteLesson(lessonId) {
        await pool.query(`DELETE FROM lessons WHERE id = $1`, [lessonId]);
    }
}

module.exports = new LessonService();
