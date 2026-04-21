const pool = require('../db');

class CourseService {
    async createCourse(title, description, author_id, status, image_url, price) {
        const newCourse = await pool.query(
            `INSERT INTO courses (title, description, author_id, status, image_url, price) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [title, description, author_id, status, image_url, price]
        );
        return newCourse.rows[0];
    }

    async getTeacherCourses(author_id) {
        const courses = await pool.query('SELECT * FROM courses WHERE author_id = $1', [author_id]);
        return courses.rows;
    }

    async getAllPublishedCourses() {
        const courses = await pool.query("SELECT c.*, u.name as author_name FROM courses c JOIN users u ON c.author_id = u.id WHERE c.status = 'published' ORDER BY c.students_count DESC");
        return courses.rows;
    }

    async getCourseById(courseId) {
        const course = await pool.query('SELECT c.*, u.name as author_name, COUNT(DISTINCT l.id) AS lessons_count FROM courses c JOIN users u ON c.author_id = u.id LEFT JOIN lessons l ON c.id = l.course_id WHERE c.id = $1 GROUP BY c.id, u.name', [courseId]);
        return course.rows[0];
    }

    async getCourseDetails(courseId) {
        const query = `
            SELECT 
                c.id, 
                c.title, 
                c.description,
                c.status,
                c.price,
                c.image_url,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', m.id,
                            'title', m.title,
                            'lessons', (
                                SELECT COALESCE(json_agg(
                                    json_build_object(
                                        'id', l.id,
                                        'title', l.title,
                                        'content', l.content,
                                        'image_url', l.image_url,
                                        'materials', (
                                            SELECT COALESCE(json_agg(
                                                json_build_object(
                                                    'id', ma.id,
                                                    'type', ma.type,
                                                    'title', ma.title,
                                                    'file_url', ma.file_url
                                                )
                                            ), '[]'::json) FROM lesson_materials ma WHERE ma.lesson_id = l.id
                                        )
                                    )
                                ), '[]'::json) FROM lessons l WHERE l.module_id = m.id
                            )
                        )
                    ) FILTER (WHERE m.id IS NOT NULL), '[]'::json
                ) as modules,
                (
                    SELECT COALESCE(json_agg(
                        json_build_object(
                            'id', l.id,
                            'title', l.title,
                            'content', l.content,
                            'image_url', l.image_url,
                            'materials', (
                                SELECT COALESCE(json_agg(
                                    json_build_object(
                                        'id', ma.id,
                                        'type', ma.type,
                                        'title', ma.title,
                                        'file_url', ma.file_url
                                    )
                                ), '[]'::json) FROM lesson_materials ma WHERE ma.lesson_id = l.id
                            )
                        )
                    ), '[]'::json)
                    FROM lessons l
                    WHERE l.course_id = c.id AND l.module_id IS NULL
                ) as lessons
            FROM courses c
            LEFT JOIN modules m ON m.course_id = c.id
            WHERE c.id = $1
            GROUP BY c.id;
        `;
        const { rows } = await pool.query(query, [courseId]);
        return rows[0];
    }

    async createModule(courseId, title) {
        const newModule = await pool.query(
            `INSERT INTO modules (course_id, title) VALUES ($1, $2) RETURNING *`,
            [courseId, title]
        );
        return newModule.rows[0];
    }

    async updateCourse(id, title, description, status, image_url, price) {
        const updatedCourse = await pool.query(
            `UPDATE courses SET title = $1, description = $2, status = $3, image_url = $4, price = $5 WHERE id = $6 RETURNING *`,
            [title, description, status, image_url, price, id]
        );
        return updatedCourse.rows[0];
    }

    async deleteCourse(id) {
        await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
    }
}

module.exports = new CourseService();
