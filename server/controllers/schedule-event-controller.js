const scheduleEventService = require('../service/schedule-event-service');

class ScheduleEventController {
    async listMine(req, res, next) {
        try {
            const userId = req.user.id;
            const events = await scheduleEventService.listForUser(userId);
            return res.json(events);
        } catch (e) {
            next(e);
        }
    }

    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const event = await scheduleEventService.createEvent(userId, role, req.body);
            return res.status(201).json(event);
        } catch (e) {
            next(e);
        }
    }

    async importLocal(req, res, next) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const events = await scheduleEventService.importFromClient(
                userId,
                role,
                req.body.events
            );
            return res.json(events);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new ScheduleEventController();
