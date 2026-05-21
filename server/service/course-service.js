const pool = require('../db');
const mailService = require('./mail-service');
const UserModel = require('../models/user-model');
const ApiError = require('../exceptions/api-error');

function normalizeCoursePrice(price) {
    const n = Number(price);
    if (Number.isNaN(n)) {
        throw ApiError.BadRequest('Некорректная цена курса');
    }
    if (n < 0) {
        throw ApiError.BadRequest('Цена не может быть отрицательной');
    }
    return n;
}

class CourseService {
    async createCourse(title, description, author_id, status, image_url, price) {
        const safePrice = normalizeCoursePrice(price ?? 0);

        const newCourse = await pool.query(
            `INSERT INTO courses (title, description, author_id, status, image_url, price) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [title, description, author_id, status, image_url, safePrice]
        );
        return newCourse.rows[0];
    }

    async getTeacherCourses(author_id) {
        const courses = await pool.query('SELECT * FROM courses WHERE author_id = $1', [author_id]);
        return courses.rows;
    }

    async getAllPublishedCourses() {
        const courses = await pool.query(
            `SELECT
                c.*,
                u.name AS author_name,
                u.avatar AS author_avatar,
                COALESCE(rev.reviews_count, 0)::int AS reviews_count,
                COALESCE(rev.average_rating, 5)::float AS average_rating
             FROM courses c
             JOIN users u ON c.author_id = u.id
             LEFT JOIN (
                SELECT
                    course_id,
                    COUNT(*)::int AS reviews_count,
                    ROUND(AVG(rating)::numeric, 1)::float AS average_rating
                FROM course_reviews
                GROUP BY course_id
             ) rev ON rev.course_id = c.id
             WHERE c.status = 'published'
             ORDER BY c.students_count DESC`
        );
        return courses.rows;
    }

    async getCourseById(courseId) {
        const course = await pool.query(
            'SELECT c.*, u.name AS author_name, u.avatar AS author_avatar, COUNT(DISTINCT l.id) AS lessons_count FROM courses c JOIN users u ON c.author_id = u.id LEFT JOIN lessons l ON c.id = l.course_id WHERE c.id = $1 GROUP BY c.id, u.name, u.avatar',
            [courseId]
        );
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
                u.name AS author_name,
                u.avatar AS author_avatar,
                COALESCE(c.students_count, 0)::int AS students_count,
                (
                    SELECT COUNT(*)::int FROM lessons lcnt WHERE lcnt.course_id = c.id
                ) AS lessons_count,
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
                                        'type', l.type,
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
                            'type', l.type,
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
            JOIN users u ON u.id = c.author_id
            LEFT JOIN modules m ON m.course_id = c.id
            WHERE c.id = $1
            GROUP BY
                c.id,
                c.title,
                c.description,
                c.status,
                c.price,
                c.image_url,
                c.author_id,
                c.students_count,
                u.id,
                u.name,
                u.avatar;
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
        const safePrice = normalizeCoursePrice(price ?? 0);

        const updatedCourse = await pool.query(
            `UPDATE courses SET title = $1, description = $2, status = $3, image_url = $4, price = $5 WHERE id = $6 RETURNING *`,
            [title, description, status, image_url, safePrice, id]
        );
        return updatedCourse.rows[0];
    }

    async deleteCourse(id) {
        await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
    }

    async enrollStudentInCourse(courseId, studentId, studentName) {
        // Check if student is already enrolled
        const existingEnrollment = await pool.query(
            `SELECT * FROM student_courses WHERE student_id = $1 AND course_id = $2`,
            [studentId, courseId]
        );

        if (existingEnrollment.rows.length > 0) {
            throw new Error('Student is already enrolled in this course.');
        }

        // Enroll student
        await pool.query(
            `INSERT INTO student_courses (student_id, course_id) VALUES ($1, $2)`,
            [studentId, courseId]
        );

        // Increment students_count in courses table
        await pool.query(
            `UPDATE courses SET students_count = COALESCE(students_count, 0) + 1 WHERE id = $1`,
            [courseId]
        );

        // Get course details and author for notification
        const course = await this.getCourseById(courseId);
        const teacher = await UserModel.findById(course.author_id);

        if (teacher && teacher.email) {
            await mailService.sendEnrollmentNotificationMail(teacher.email, studentName, course.title);
        }

        return { message: 'Enrollment successful', course, studentId };
    }

    async getStudentEnrollments(studentId) {
        const query = `
            SELECT 
                c.*, 
                u.name AS author_name,
                u.avatar AS author_avatar,
                (
                    SELECT COUNT(l.id)::int
                    FROM lessons l
                    WHERE l.course_id = c.id
                ) AS lessons_count,
                (
                    SELECT COUNT(l.id)::int
                    FROM lessons l
                    WHERE l.course_id = c.id
                      AND l.type IN ('assignment', 'test')
                ) AS gradable_lessons_count,
                (
                    SELECT COUNT(DISTINCT l.id)::int
                    FROM lessons l
                    INNER JOIN submissions s
                        ON s.lesson_id = l.id
                       AND s.student_id = $1
                    WHERE l.course_id = c.id
                      AND s.review_status = 'passed'
                ) AS completed_lessons
            FROM student_courses sc
            JOIN courses c ON sc.course_id = c.id
            JOIN users u ON c.author_id = u.id
            WHERE sc.student_id = $1;
        `;
        const { rows } = await pool.query(query, [studentId]);
        return rows;
    }
}

module.exports = new CourseService();
