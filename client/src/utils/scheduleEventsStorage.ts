import $api from '../http';
import { ScheduleEvent } from '../types/scheduleEvent';
import { getCourseColor } from './scheduleCourseColors';

const storageKey = (userId: string | number) => `schedule-events-${String(userId)}`;

/** Нормализует YYYY-M-D → YYYY-MM-DD */
export function normalizeScheduleDateKey(date: string): string {
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const [y, m, d] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function normalizeEvent(raw: unknown): ScheduleEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = o.id != null ? String(o.id) : null;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const date =
    typeof o.date === 'string'
      ? normalizeScheduleDateKey(o.date)
      : typeof o.event_date === 'string'
        ? normalizeScheduleDateKey(String(o.event_date).slice(0, 10))
        : null;
  const startTime =
    typeof o.startTime === 'string'
      ? o.startTime.slice(0, 5)
      : typeof o.start_time === 'string'
        ? String(o.start_time).slice(0, 5)
        : null;
  const endTime =
    typeof o.endTime === 'string'
      ? o.endTime.slice(0, 5)
      : typeof o.end_time === 'string'
        ? String(o.end_time).slice(0, 5)
        : null;
  const courseId = Number(o.courseId ?? o.course_id);
  const courseTitle =
    typeof o.courseTitle === 'string'
      ? o.courseTitle
      : typeof o.course_title === 'string'
        ? o.course_title
        : '';

  if (!id || !title || !date || !startTime || !endTime || !Number.isFinite(courseId)) {
    return null;
  }

  const type =
    o.type === 'task' || o.type === 'reminder' || o.type === 'event' ? o.type : 'task';

  return {
    id,
    type,
    courseId,
    courseTitle,
    courseColor: getCourseColor(courseId),
    title,
    date,
    startTime,
    endTime,
    description: typeof o.description === 'string' ? o.description : '',
  };
}

export function loadScheduleEventsFromLocal(userId: string | number): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeEvent)
      .filter((ev): ev is ScheduleEvent => ev != null);
  } catch {
    return [];
  }
}

export function saveScheduleEventsToLocal(
  userId: string | number,
  events: ScheduleEvent[]
): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(events));
}

export function clearScheduleEventsLocal(userId: string | number): void {
  localStorage.removeItem(storageKey(userId));
}

/** @deprecated используйте fetchScheduleEvents */
export function loadScheduleEvents(userId: string | number): ScheduleEvent[] {
  return loadScheduleEventsFromLocal(userId);
}

/** @deprecated используйте createScheduleEvent */
export function saveScheduleEvents(userId: string | number, events: ScheduleEvent[]): void {
  saveScheduleEventsToLocal(userId, events);
}

export async function fetchScheduleEvents(
  userId: string | number
): Promise<ScheduleEvent[]> {
  try {
    const response = await $api.get<unknown[]>('/schedule/events');
    let events = (response.data || [])
      .map(normalizeEvent)
      .filter((ev): ev is ScheduleEvent => ev != null);

    const local = loadScheduleEventsFromLocal(userId);
    if (local.length > 0 && events.length === 0) {
      const imported = await $api.post<unknown[]>('/schedule/events/import', {
        events: local,
      });
      events = (imported.data || [])
        .map(normalizeEvent)
        .filter((ev): ev is ScheduleEvent => ev != null);
      clearScheduleEventsLocal(userId);
    }

    return events;
  } catch (e) {
    console.log('FULL ERROR (schedule events, local fallback):', e);
    return loadScheduleEventsFromLocal(userId);
  }
}

export async function createScheduleEvent(
  event: Pick<
    ScheduleEvent,
    | 'type'
    | 'courseId'
    | 'title'
    | 'date'
    | 'startTime'
    | 'endTime'
    | 'description'
  >
): Promise<ScheduleEvent | null> {
  const response = await $api.post<unknown>('/schedule/events', {
    type: event.type,
    courseId: Number(event.courseId),
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    description: event.description,
  });
  return normalizeEvent(response.data);
}

type ScheduleEventPayload = Pick<
  ScheduleEvent,
  'type' | 'courseId' | 'title' | 'date' | 'startTime' | 'endTime' | 'description'
>;

function toApiEventBody(event: ScheduleEventPayload) {
  return {
    type: event.type,
    courseId: Number(event.courseId),
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    description: event.description,
  };
}

export async function updateScheduleEvent(
  eventId: string,
  event: ScheduleEventPayload
): Promise<ScheduleEvent | null> {
  const response = await $api.put<unknown>(`/schedule/events/${eventId}`, toApiEventBody(event));
  return normalizeEvent(response.data);
}

export async function deleteScheduleEvent(eventId: string): Promise<void> {
  await $api.delete(`/schedule/events/${eventId}`);
}
