import React from 'react';
import { Icon } from '@iconify/react';
import ScheduleCalendar from '../teacher/schedule/ScheduleCalendar';
import ScheduleCategoryList from './ScheduleCategoryList';
import { ICourse } from '../../models/ICourse';
import { ScheduleEvent } from '../../types/scheduleEvent';

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddEvent: () => void;
  calendarSyncEnabled: boolean;
  calendarSyncLoading: boolean;
  onCalendarSyncToggle: () => void | Promise<void>;
  courses: ICourse[];
  events: ScheduleEvent[];
};

const ScheduleSidebar: React.FC<Props> = ({
  selectedDate,
  onDateChange,
  onAddEvent,
  calendarSyncEnabled,
  calendarSyncLoading,
  onCalendarSyncToggle,
  courses,
  events,
}) => (
  <div className="schedule-sidebar">
    <button
      type="button"
      className="schedule-add-event-btn schedule-add-event-btn--sidebar"
      onClick={onAddEvent}
    >
      <Icon icon="mdi:plus" />
      Добавить событие
    </button>
    <button
      type="button"
      className={`schedule-google-sync-btn${calendarSyncEnabled ? ' schedule-google-sync-btn--on' : ''}`}
      disabled={calendarSyncLoading}
      onClick={() => void onCalendarSyncToggle()}
    >
      <Icon icon="mdi:google" />
      {calendarSyncLoading
        ? 'Подключение…'
        : calendarSyncEnabled
          ? 'Отключить Google Календарь'
          : 'Синхронизировать с Google'}
    </button>
    <ScheduleCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
    <ScheduleCategoryList courses={courses} events={events} selectedDate={selectedDate} />
  </div>
);

export default ScheduleSidebar;
