const submissionService = require('../service/submission-service');

class SubmissionController {
    async submitAssignment(req, res, next) {
        try {
            const { lessonId, type, content, items } = req.body;
            const studentId = req.user.id;
            const submission = await submissionService.submitAssignment(
                lessonId,
                studentId,
                type,
                content,
                items
            );
            return res.json(submission);
        } catch (e) {
            next(e);
        }
    }

    async getSubmissionsByLesson(req, res, next) {
        try {
            const { lessonId } = req.params;
            const submissions = await submissionService.getSubmissionsByLesson(lessonId);
            return res.json(submissions);
        } catch (e) {
            next(e);
        }
    }

    async getStudentSubmission(req, res, next) {
        try {
            const { lessonId } = req.params;
            const studentId = req.user.id;
            const submission = await submissionService.getStudentSubmission(lessonId, studentId);
            return res.json(submission);
        } catch (e) {
            next(e);
        }
    }

    async deleteMySubmission(req, res, next) {
        try {
            const { lessonId } = req.params;
            const studentId = req.user.id;
            const deleted = await submissionService.deleteStudentSubmission(lessonId, studentId);
            if (!deleted) {
                return res.status(404).json({ message: 'Отправка не найдена' });
            }
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SubmissionController();
