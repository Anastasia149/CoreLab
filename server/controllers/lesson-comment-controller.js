const lessonCommentService = require('../service/lesson-comment-service');

class LessonCommentController {
    async getMyThread(req, res, next) {
        try {
            const { lessonId } = req.params;
            const studentId = req.user.id;
            const data = await lessonCommentService.getMyThread(lessonId, studentId);
            return res.json(data);
        } catch (e) {
            next(e);
        }
    }

    async postMyMessage(req, res, next) {
        try {
            const { lessonId } = req.params;
            const studentId = req.user.id;
            const { body } = req.body;
            const message = await lessonCommentService.postStudentMessage(
                lessonId,
                studentId,
                body
            );
            return res.status(201).json(message);
        } catch (e) {
            next(e);
        }
    }

    async getLessonThreads(req, res, next) {
        try {
            const { lessonId } = req.params;
            const teacherId = req.user.id;
            const data = await lessonCommentService.getLessonThreads(lessonId, teacherId);
            return res.json(data);
        } catch (e) {
            next(e);
        }
    }

    async postTeacherReply(req, res, next) {
        try {
            const { lessonId, studentId } = req.params;
            const teacherId = req.user.id;
            const { body } = req.body;
            const message = await lessonCommentService.postTeacherReply(
                lessonId,
                teacherId,
                studentId,
                body
            );
            return res.status(201).json(message);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new LessonCommentController();
