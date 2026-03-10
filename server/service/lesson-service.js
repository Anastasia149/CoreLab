const pool = require('../db');
const fileService = require('./file-service');

class LessonService {
    async createLesson(courseId, moduleId, title, content, imageUrl) {
        const newLesson = await pool.query(
            `INSERT INTO lessons (course_id, module_id, title, content, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [courseId, moduleId, title, content, imageUrl]
        );
        return newLesson.rows[0];
    }

    async createLessonMaterial(lessonId, file) {
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
            [lessonId, type, file.name, fileUrl]
        );
        return newMaterial.rows[0];
    }

    async getLessonById(lessonId) {
        const query = `
            SELECT 
                l.*,
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
            LEFT JOIN lesson_materials ma ON ma.lesson_id = l.id
            WHERE l.id = $1
            GROUP BY l.id;
        `;
        const { rows } = await pool.query(query, [lessonId]);
        return rows[0];
    }

    async updateLesson(lessonId, title, content, moduleId, imageUrl) {
        const updatedLesson = await pool.query(
            `UPDATE lessons SET title = $1, content = $2, module_id = $3, image_url = $4 WHERE id = $5 RETURNING *`,
            [title, content, moduleId, imageUrl, lessonId]
        );
        return updatedLesson.rows[0];
    }

    async deleteLessonMaterial(materialId) {
        await pool.query(`DELETE FROM lesson_materials WHERE id = $1`, [materialId]);
    }

    async deleteLesson(lessonId) {
        await pool.query(`DELETE FROM lessons WHERE id = $1`, [lessonId]);
    }
}

module.exports = new LessonService();
