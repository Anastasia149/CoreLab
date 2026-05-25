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
                u.id AS author_id,
                u.name AS author_name,
                u.avatar AS author_avatar,
                u.about_me AS author_about_me,
                (
                    SELECT COUNT(*)::int
                    FROM course_reviews r
                    JOIN courses c2 ON c2.id = r.course_id
                    WHERE c2.author_id = c.author_id
                ) AS author_reviews_count,
                (
                    SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::float
                    FROM course_reviews r
                    JOIN courses c2 ON c2.id = r.course_id
                    WHERE c2.author_id = c.author_id
                ) AS author_average_rating,
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
                u.avatar,
                u.about_me;
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

    async assertTeacherOwnsCourse(courseId, teacherId) {
        const { rows } = await pool.query(
            `SELECT author_id FROM courses WHERE id = $1`,
            [courseId]
        );
        if (rows.length === 0) {
            throw new ApiError(404, 'Курс не найден');
        }
        if (Number(rows[0].author_id) !== Number(teacherId)) {
            throw new ApiError(403, 'Нет доступа к этому курсу');
        }
    }

    async getCourseStudents(courseId, teacherId) {
        await this.assertTeacherOwnsCourse(courseId, teacherId);
        const { rows } = await pool.query(
            `SELECT u.id, u.name, u.email, u.avatar
             FROM student_courses sc
             JOIN users u ON u.id = sc.student_id
             WHERE sc.course_id = $1
             ORDER BY COALESCE(NULLIF(TRIM(u.name), ''), u.email) ASC`,
            [courseId]
        );
        return rows;
    }

    async getCourseStudentProfile(courseId, studentId, teacherId) {
        await this.assertTeacherOwnsCourse(courseId, teacherId);
        const { rows } = await pool.query(
            `SELECT u.id, u.name, u.email, u.avatar
             FROM student_courses sc
             JOIN users u ON u.id = sc.student_id
             WHERE sc.course_id = $1 AND sc.student_id = $2`,
            [courseId, studentId]
        );
        if (rows.length === 0) {
            throw new ApiError(404, 'Ученик не найден на этом курсе');
        }
        return rows[0];
    }

    async getCourseInstructorProfile(courseId, studentId) {
        const enrollment = await pool.query(
            `SELECT 1 FROM student_courses WHERE course_id = $1 AND student_id = $2`,
            [courseId, studentId]
        );
        if (enrollment.rows.length === 0) {
            throw new ApiError(403, 'Нет доступа к профилю преподавателя этого курса');
        }

        const { rows } = await pool.query(
            `SELECT u.id, u.name, u.avatar, u.about_me, u.certificates, u.career
             FROM courses c
             JOIN users u ON u.id = c.author_id
             WHERE c.id = $1`,
            [courseId]
        );
        if (rows.length === 0) {
            throw new ApiError(404, 'Курс не найден');
        }

        const instructor = rows[0];
        return {
            id: instructor.id,
            name: instructor.name,
            avatar: instructor.avatar,
            aboutMe: instructor.about_me,
            certificates: instructor.certificates,
            career: instructor.career,
        };
    }

    async removeStudentFromCourse(courseId, studentId, teacherId) {
        await this.assertTeacherOwnsCourse(courseId, teacherId);
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                `DELETE FROM submissions s
                 USING lessons l
                 WHERE s.lesson_id = l.id
                   AND l.course_id = $1
                   AND s.student_id = $2`,
                [courseId, studentId]
            );
            await client.query(
                `DELETE FROM course_reviews WHERE course_id = $1 AND student_id = $2`,
                [courseId, studentId]
            );
            const removed = await client.query(
                `DELETE FROM student_courses
                 WHERE course_id = $1 AND student_id = $2
                 RETURNING student_id`,
                [courseId, studentId]
            );
            if (removed.rowCount === 0) {
                throw new ApiError(404, 'Ученик не записан на этот курс');
            }
            await client.query(
                `UPDATE courses
                 SET students_count = GREATEST(COALESCE(students_count, 0) - 1, 0)
                 WHERE id = $1`,
                [courseId]
            );
            await client.query('COMMIT');
            return { message: 'Ученик удалён с курса' };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
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

        if (teacher && course.author_id) {
            const notificationService = require('./notification-service');
            await notificationService.createEnrollmentNotification(course.author_id, {
                studentName,
                courseTitle: course.title,
                courseId: Number(courseId),
            });
        }

        return { message: 'Enrollment successful', course, studentId };
    }

    async getStudentTodayTasks(studentId) {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const { rows } = await pool.query(
            `SELECT
                l.id AS lesson_id,
                l.title AS lesson_title,
                l.type AS lesson_type,
                l.deadline,
                c.id AS course_id,
                c.title AS course_title,
                EXISTS (
                    SELECT 1 FROM submissions s
                    WHERE s.lesson_id = l.id
                      AND s.student_id = $1
                      AND s.review_status = 'passed'
                ) AS is_completed
             FROM student_courses sc
             JOIN lessons l ON l.course_id = sc.course_id
             JOIN courses c ON c.id = sc.course_id
             WHERE sc.student_id = $1
               AND l.type IN ('assignment', 'test')
               AND l.deadline IS NOT NULL
               AND l.deadline >= $2
               AND l.deadline < $3
             ORDER BY l.deadline ASC`,
            [studentId, dayStart.toISOString(), dayEnd.toISOString()]
        );

        return rows.map((row) => ({
            lessonId: row.lesson_id,
            lessonTitle: row.lesson_title,
            lessonType: row.lesson_type,
            deadline: row.deadline,
            courseId: row.course_id,
            courseTitle: row.course_title,
            isCompleted: Boolean(row.is_completed),
        }));
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
