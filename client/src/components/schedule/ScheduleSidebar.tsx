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
  courses: ICourse[];
  events: ScheduleEvent[];
};

const ScheduleSidebar: React.FC<Props> = ({
  selectedDate,
  onDateChange,
  onAddEvent,
  courses,
  events,
}) => (
  <div className="schedule-sidebar">
    <button type="button" className="schedule-add-event-btn" onClick={onAddEvent}>
      <Icon icon="mdi:plus" />
      Добавить событие
    </button>
    <ScheduleCalendar selectedDate={selectedDate} onDateChange={onDateChange} />
    <ScheduleCategoryList courses={courses} events={events} />
  </div>
);

export default ScheduleSidebar;
