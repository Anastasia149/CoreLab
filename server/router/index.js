const Router = require('express');
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

const courseController = require('../controllers/course-controller');

const fileController = require('../controllers/file-controller');
const lessonController = require('../controllers/lesson-controller');
const submissionController = require('../controllers/submission-controller');
const courseReviewController = require('../controllers/course-review-controller');
const scheduleEventController = require('../controllers/schedule-event-controller');
const notificationController = require('../controllers/notification-controller');

router.post('/registration', 
    body('name').isLength({min: 1, max: 20}),
    body('email').isEmail().isLength({ min: 5, max: 40 }),
    body('password').isLength({min: 3, max: 20}),
    userController.registration
);
router.post('/login',
    body('email').isEmail().isLength({ min: 5, max: 40 }),
    body('password').isLength({min: 3, max: 20}),
    userController.login
);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.get('/activate/:link', userController.activation);
router.get('/users', authMiddleware, userController.getUsers);
router.put('/users/profile',
    authMiddleware,
    body('name').isLength({ min: 1, max: 20 }),
    body('email').isEmail().isLength({ min: 5, max: 40 }),
    body('avatar').optional({ nullable: true }).isString(),
    body('aboutMe').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    body('certificates').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    body('career').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    userController.updateProfile
);
router.delete('/users/account', authMiddleware, userController.deleteAccount);
router.post('/courses', authMiddleware, courseController.createCourse);
router.get('/courses', courseController.getAllPublishedCourses);
router.get('/courses/my', authMiddleware, courseController.getStudentEnrollments);
router.get('/courses/my/today-tasks', authMiddleware, courseController.getStudentTodayTasks);
router.get('/courses/:courseId/my-grades', authMiddleware, submissionController.getMyCourseGrades);
router.get(
    '/courses/:courseId/instructor',
    authMiddleware,
    courseController.getCourseInstructorProfile
);
router.get('/courses/:courseId/reviews', courseReviewController.getCourseReviews);
router.get('/courses/:courseId/my-review', authMiddleware, courseReviewController.getMyReview);
router.put(
    '/courses/:courseId/my-review',
    authMiddleware,
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional({ nullable: true }).isString().isLength({ max: 2000 }),
    courseReviewController.upsertMyReview
);
router.get('/courses/:id', courseController.getCourseById);
router.put('/courses/:id', authMiddleware, courseController.updateCourse);
router.delete('/courses/:id', authMiddleware, courseController.deleteCourse);
router.get('/teacher/courses', authMiddleware, courseController.getTeacherCourses);
router.get('/teacher/course/:id', authMiddleware, courseController.getCourseDetails);
router.get('/teacher/course/:courseId/students', authMiddleware, courseController.getCourseStudents);
router.get(
    '/teacher/course/:courseId/students/:studentId',
    authMiddleware,
    courseController.getCourseStudentProfile
);
router.delete(
    '/teacher/course/:courseId/students/:studentId',
    authMiddleware,
    courseController.removeStudentFromCourse
);
router.post('/courses/:courseId/enroll', authMiddleware, courseController.enrollStudentInCourse);
router.post('/courses/:courseId/modules', authMiddleware, courseController.createModule);
router.post('/upload', authMiddleware, fileController.uploadFile);
router.post('/lessons', authMiddleware, lessonController.createLesson);
router.get('/lessons/:lessonId', authMiddleware, lessonController.getLesson);
router.post('/lessons/:lessonId/materials', authMiddleware, lessonController.uploadMaterial);
router.put('/lessons/:lessonId', authMiddleware, lessonController.updateLesson);
router.delete('/lessons/materials/:materialId', authMiddleware, lessonController.deleteMaterial);
router.delete('/lessons/:lessonId', authMiddleware, lessonController.deleteLesson);

router.post('/submissions', authMiddleware, submissionController.submitAssignment);
router.get('/lessons/:lessonId/submissions', authMiddleware, submissionController.getSubmissionsByLesson);
router.get('/lessons/:lessonId/my-submission', authMiddleware, submissionController.getStudentSubmission);
router.get('/lessons/:lessonId/my-test-review', authMiddleware, submissionController.getMyTestReview);
router.delete('/lessons/:lessonId/my-submission', authMiddleware, submissionController.deleteMySubmission);
router.get('/submissions/:submissionId/test-review', authMiddleware, submissionController.getSubmissionTestReview);
router.patch('/submissions/:submissionId/review', authMiddleware, submissionController.updateReviewStatus);

router.get('/schedule/events', authMiddleware, scheduleEventController.listMine);
router.post('/schedule/events', authMiddleware, scheduleEventController.create);
router.post('/schedule/events/import', authMiddleware, scheduleEventController.importLocal);

router.get('/notifications', authMiddleware, notificationController.listMine);
router.delete('/notifications', authMiddleware, notificationController.deleteAll);
router.delete('/notifications/:id', authMiddleware, notificationController.deleteOne);

module.exports = router;
