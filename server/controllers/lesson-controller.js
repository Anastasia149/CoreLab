const lessonService = require('../service/lesson-service');
const { sanitizeTestContentForStudent } = require('../utils/test-grading');

class LessonController {
    async createLesson(req, res, next) {
        try {
            const { courseId, moduleId, title, content, imageUrl, type, deadline } = req.body;
            const lessonData = await lessonService.createLesson(
                courseId,
                moduleId,
                title,
                content,
                imageUrl,
                type,
                deadline ?? null
            );
            return res.json(lessonData);
        } catch (e) {
            next(e);
        }
    }

    async updateLesson(req, res, next) {
        try {
            const { lessonId } = req.params;
            const { title, content, moduleId, imageUrl, type, deadline } = req.body;
            const lesson = await lessonService.updateLesson(
                lessonId,
                title,
                content,
                moduleId,
                imageUrl,
                type,
                deadline ?? null
            );
            return res.json(lesson);
        } catch (e) {
            next(e);
        }
    }

    async getLesson(req, res, next) {
        try {
            const { lessonId } = req.params;
            const lesson = await lessonService.getLessonById(lessonId);
            if (!lesson) {
                return res.status(404).json({ message: 'Урок не найден' });
            }

            const payload = { ...lesson };
            if (
                lesson.type === 'test' &&
                req.user?.role === 'student' &&
                lesson.content
            ) {
                try {
                    payload.content = sanitizeTestContentForStudent(lesson.content);
                } catch {
                    payload.content = '[]';
                }
            }

            return res.json(payload);
        } catch (e) {
            next(e);
        }
    }

    async uploadMaterial(req, res, next) {
        try {
            const { lessonId } = req.params;
            const { file } = req.files;
            const material = await lessonService.createLessonMaterial(lessonId, file);
            return res.json(material);
        } catch (e) {
            next(e);
        }
    }

    async deleteMaterial(req, res, next) {
        try {
            const { materialId } = req.params;
            await lessonService.deleteLessonMaterial(materialId);
            return res.status(200).json({ message: 'Материал удален' });
        } catch (e) {
            next(e);
        }
    }

    async deleteLesson(req, res, next) {
        try {
            const { lessonId } = req.params;
            await lessonService.deleteLesson(lessonId);
            return res.status(200).json({ message: 'Урок удален' });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new LessonController();
