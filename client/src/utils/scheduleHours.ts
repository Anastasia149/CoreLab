/** Часы в сетке расписания: с 8:00 по 20:00 включительно */
export const SCHEDULE_START_HOUR = 8;
export const SCHEDULE_END_HOUR = 20;

export const SCHEDULE_SLOT_COUNT =
  SCHEDULE_END_HOUR - SCHEDULE_START_HOUR + 1;

export const scheduleHours = Array.from(
  { length: SCHEDULE_SLOT_COUNT },
  (_, i) => SCHEDULE_START_HOUR + i
);

export const formatScheduleHour = (hour: number) =>
  `${hour < 10 ? `0${hour}` : hour}:00`;

/** Высота одного часового слота в сетке (px), должна совпадать с CSS */
export const SCHEDULE_SLOT_HEIGHT_PX = 49;

export const SCHEDULE_GRID_HEIGHT_PX =
  SCHEDULE_SLOT_COUNT * SCHEDULE_SLOT_HEIGHT_PX;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Часовой слот [hour:00, (hour+1):00) пересекается с событием */
export function eventCoversHour(event: { startTime: string; endTime: string }, hour: number): boolean {
  const slotStart = hour * 60;
  const slotEnd = (hour + 1) * 60;
  const evStart = timeToMinutes(event.startTime);
  const evEnd = timeToMinutes(event.endTime);
  return evStart < slotEnd && evEnd > slotStart;
}

export function findEventForHour<T extends { startTime: string; endTime: string }>(
  hour: number,
  events: T[]
): T | null {
  return events.find((ev) => eventCoversHour(ev, hour)) ?? null;
}

/** Сколько подряд идущих часовых слотов занимает одно событие, начиная с hour */
export function eventHourSpan<T extends { id: string; startTime: string; endTime: string }>(
  startHour: number,
  event: T,
  events: T[],
  hours: number[] = scheduleHours
): number {
  const startIdx = hours.indexOf(startHour);
  if (startIdx < 0) return 1;

  let span = 0;
  for (let i = startIdx; i < hours.length; i++) {
    const ev = findEventForHour(hours[i], events);
    if (ev?.id !== event.id) break;
    span++;
  }
  return Math.max(span, 1);
}

export function getEventPositionPercent(startTime: string, endTime: string) {
  const dayStart = SCHEDULE_START_HOUR * 60;
  const rangeMinutes = SCHEDULE_SLOT_COUNT * 60;
  const start = Math.max(timeToMinutes(startTime), dayStart);
  const end = Math.min(timeToMinutes(endTime), dayStart + rangeMinutes);
  const top = ((start - dayStart) / rangeMinutes) * 100;
  const height = Math.max(((end - start) / rangeMinutes) * 100, 4);
  return { top, height };
}

/** Сетка «Моё расписание» на главной: слот 48px + отступ 12px между часами */
export const DASHBOARD_SLOT_HEIGHT_PX = 48;
export const DASHBOARD_SLOT_GAP_PX = 12;
export const DASHBOARD_HOUR_TRACK_PX =
  DASHBOARD_SLOT_HEIGHT_PX + DASHBOARD_SLOT_GAP_PX;

export function getDashboardGridHeightPx(): number {
  return (
    scheduleHours.length * DASHBOARD_SLOT_HEIGHT_PX +
    (scheduleHours.length - 1) * DASHBOARD_SLOT_GAP_PX
  );
}

function minutesToDashboardPxStart(minutesFromMidnight: number): number {
  const fromStart = minutesFromMidnight - SCHEDULE_START_HOUR * 60;
  const maxMinutes = SCHEDULE_SLOT_COUNT * 60;
  const clamped = Math.max(0, Math.min(fromStart, maxMinutes));
  const hourIndex = Math.floor(clamped / 60);
  const minuteInHour = clamped % 60;
  return (
    hourIndex * DASHBOARD_HOUR_TRACK_PX +
    (minuteInHour / 60) * DASHBOARD_SLOT_HEIGHT_PX
  );
}

/** Конец интервала: на границе часа — низ слота, без межстрочного gap */
function minutesToDashboardPxEnd(minutesFromMidnight: number): number {
  const fromStart = minutesFromMidnight - SCHEDULE_START_HOUR * 60;
  const maxMinutes = SCHEDULE_SLOT_COUNT * 60;
  const clamped = Math.max(0, Math.min(fromStart, maxMinutes));
  const hourIndex = Math.floor(clamped / 60);
  const minuteInHour = clamped % 60;

  if (minuteInHour === 0 && clamped > 0) {
    return hourIndex * DASHBOARD_HOUR_TRACK_PX - DASHBOARD_SLOT_GAP_PX;
  }

  return (
    hourIndex * DASHBOARD_HOUR_TRACK_PX +
    (minuteInHour / 60) * DASHBOARD_SLOT_HEIGHT_PX
  );
}

/** Точная позиция блока события от startTime до endTime (px) */
export function getEventDashboardPositionPx(startTime: string, endTime: string) {
  const dayStart = SCHEDULE_START_HOUR * 60;
  const dayEnd = dayStart + SCHEDULE_SLOT_COUNT * 60;
  const start = Math.max(timeToMinutes(startTime), dayStart);
  const end = Math.min(timeToMinutes(endTime), dayEnd);
  const top = minutesToDashboardPxStart(start);
  const bottom = minutesToDashboardPxEnd(end);
  const height = Math.max(bottom - top, 24);
  return { top, height };
}
