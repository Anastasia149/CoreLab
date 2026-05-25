const submissionService = require('../service/submission-service');

class SubmissionController {
    async submitAssignment(req, res, next) {
        try {
            const { lessonId, type, content, items, answers } = req.body;
            const studentId = req.user.id;

            if (answers != null || type === 'test') {
                const submission = await submissionService.submitTest(
                    lessonId,
                    studentId,
                    answers
                );
                return res.json(submission);
            }

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

    async getMyTestReview(req, res, next) {
        try {
            const { lessonId } = req.params;
            const studentId = req.user.id;
            const review = await submissionService.getTestReviewForStudent(
                lessonId,
                studentId
            );
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async getMyCourseGrades(req, res, next) {
        try {
            const { courseId } = req.params;
            const studentId = req.user.id;
            const grades = await submissionService.getStudentCourseGrades(courseId, studentId);
            return res.json(grades);
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

    async getSubmissionTestReview(req, res, next) {
        try {
            const { submissionId } = req.params;
            const teacherId = req.user.id;
            const review = await submissionService.getTestReviewForTeacher(
                submissionId,
                teacherId
            );
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async updateReviewStatus(req, res, next) {
        try {
            const { submissionId } = req.params;
            const { status } = req.body;
            const teacherId = req.user.id;
            const submission = await submissionService.updateReviewStatus(
                submissionId,
                teacherId,
                status
            );
            return res.json(submission);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SubmissionController();
