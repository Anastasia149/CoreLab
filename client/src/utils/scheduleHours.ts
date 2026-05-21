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
