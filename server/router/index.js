const Router = require('express');
const userController = require('../controllers/user-controller');
const router = new Router();
const {body} = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');

const courseController = require('../controllers/course-controller');

const fileController = require('../controllers/file-controller');
const lessonController = require('../controllers/lesson-controller');
const submissionController = require('../controllers/submission-controller');

router.post('/registration', 
    body('name').isLength({min: 1, max: 64}),
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/refresh', userController.refresh);
router.get('/activate/:link', userController.activation);
router.get('/users', authMiddleware, userController.getUsers);
router.put('/users/profile',
    authMiddleware,
    body('name').isLength({ min: 1, max: 128 }),
    body('email').isEmail(),
    body('avatar').optional({ nullable: true }).isString(),
    body('aboutMe').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    body('certificates').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    body('career').optional({ nullable: true }).isString().isLength({ max: 12000 }),
    userController.updateProfile
);
router.delete('/users/account', authMiddleware, userController.deleteAccount);
router.post('/courses', authMiddleware, courseController.createCourse);
router.get('/courses', courseController.getAllPublishedCourses);
router.get('/courses/:id', courseController.getCourseById);
router.put('/courses/:id', authMiddleware, courseController.updateCourse);
router.delete('/courses/:id', authMiddleware, courseController.deleteCourse);
router.get('/teacher/courses', authMiddleware, courseController.getTeacherCourses);
router.get('/teacher/course/:id', authMiddleware, courseController.getCourseDetails);
router.post('/courses/:courseId/enroll', authMiddleware, courseController.enrollStudentInCourse);
router.get('/courses/my', authMiddleware, courseController.getStudentEnrollments);
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
router.delete('/lessons/:lessonId/my-submission', authMiddleware, submissionController.deleteMySubmission);
router.patch('/submissions/:submissionId/review', authMiddleware, submissionController.updateReviewStatus);

module.exports = router;
