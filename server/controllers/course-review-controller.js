const courseReviewService = require('../service/course-review-service');

class CourseReviewController {
    async getCourseReviews(req, res, next) {
        try {
            const { courseId } = req.params;
            const data = await courseReviewService.getCourseReviews(courseId);
            return res.json(data);
        } catch (e) {
            next(e);
        }
    }

    async getMyReview(req, res, next) {
        try {
            const { courseId } = req.params;
            const studentId = req.user.id;
            const review = await courseReviewService.getMyReview(courseId, studentId);
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }

    async upsertMyReview(req, res, next) {
        try {
            const { courseId } = req.params;
            const studentId = req.user.id;
            const { rating, comment } = req.body;
            const review = await courseReviewService.upsertMyReview(
                courseId,
                studentId,
                rating,
                comment
            );
            return res.json(review);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CourseReviewController();
