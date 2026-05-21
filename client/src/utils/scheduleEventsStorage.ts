import { ScheduleEvent } from '../types/scheduleEvent';

const storageKey = (userId: string) => `schedule-events-${userId}`;

export function loadScheduleEvents(userId: string): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveScheduleEvents(userId: string, events: ScheduleEvent[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(events));
}
