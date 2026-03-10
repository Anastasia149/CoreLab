const courseService = require('../service/course-service');

class CourseController {
    async createCourse(req, res, next) {
        try {
            const { title, description, status, image_url, price } = req.body;
            const author_id = req.user.id;
            const courseData = await courseService.createCourse(title, description, author_id, status, image_url, price);
            return res.json(courseData);
        } catch (e) {
            next(e);
        }
    }

    async createModule(req, res, next) {
        try {
            const { courseId } = req.params;
            const { title } = req.body;
            const moduleData = await courseService.createModule(courseId, title);
            return res.json(moduleData);
        } catch (e) {
            next(e);
        }
    }

    async getTeacherCourses(req, res, next) {
        try {
            const author_id = req.user.id;
            const courses = await courseService.getTeacherCourses(author_id);
            return res.json(courses);
        } catch (e) {
            next(e);
        }
    }

    async getCourseDetails(req, res, next) {
        try {
            const { id } = req.params;
            const courseDetails = await courseService.getCourseDetails(id);
            return res.json(courseDetails);
        } catch (e) {
            next(e);
        }
    }

    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, status, image_url, price } = req.body;
            const courseData = await courseService.updateCourse(id, title, description, status, image_url, price);
            return res.json(courseData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CourseController();
