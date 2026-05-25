const notificationService = require('../service/notification-service');

function iconForType(type, message = '') {
    const icons = {
        enrollment: 'mdi:account-school-outline',
        assignment_submitted: 'mdi:file-document-edit-outline',
        submission_review: 'mdi:clipboard-check-outline',
    };
    if (type === 'submission_review') {
        if (message.includes(': Сдал')) return 'mdi:check-circle-outline';
        if (message.includes(': Не сдал')) return 'mdi:close-circle-outline';
    }
    return icons[type] || 'solar:bell-linear';
}

class NotificationController {
    async listMine(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await notificationService.listForUser(userId);
            return res.json({
                items: data.items.map((row) => ({
                    id: row.id,
                    type: row.type,
                    message: row.message,
                    courseId: row.course_id,
                    lessonId: row.lesson_id,
                    isRead: row.is_read,
                    createdAt: row.created_at,
                    icon: iconForType(row.type, row.message),
                })),
                unreadCount: data.unreadCount,
            });
        } catch (e) {
            next(e);
        }
    }

    async deleteAll(req, res, next) {
        try {
            const userId = req.user.id;
            await notificationService.deleteAllForUser(userId);
            return res.json({ unreadCount: 0 });
        } catch (e) {
            next(e);
        }
    }

    async deleteOne(req, res, next) {
        try {
            const userId = req.user.id;
            const notificationId = Number(req.params.id);
            if (!Number.isFinite(notificationId)) {
                const ApiError = require('../exceptions/api-error');
                throw ApiError.BadRequest('Некорректный идентификатор уведомления');
            }
            await notificationService.deleteById(userId, notificationId);
            return res.status(204).send();
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new NotificationController();
