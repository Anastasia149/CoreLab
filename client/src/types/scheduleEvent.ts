export type ScheduleEventType = 'task' | 'reminder' | 'event';

export interface ScheduleEvent {
  id: string;
  type: ScheduleEventType;
  courseId: number;
  courseTitle: string;
  courseColor: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

export const SCHEDULE_EVENT_TYPE_LABELS: Record<ScheduleEventType, string> = {
  task: 'Задача',
  reminder: 'Напоминание',
  event: 'Событие',
};
