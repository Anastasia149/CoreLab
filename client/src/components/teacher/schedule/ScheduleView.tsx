import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import './ScheduleView.css';
import ScheduleEventCard from '../../schedule/ScheduleEventCard';
import { ScheduleEvent } from '../../../types/scheduleEvent';
import {
  formatScheduleHour,
  getEventTimelinePositionPx,
  scheduleHours,
  SCHEDULE_GRID_HEIGHT_PX,
  SCHEDULE_SLOT_HEIGHT_PX,
  toDateKey,
} from '../../../utils/scheduleHours';

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: ScheduleEvent[];
  onEventClick?: (event: ScheduleEvent) => void;
};

const ScheduleView: React.FC<Props> = ({ selectedDate, onDateChange, events, onEventClick }) => {
  const selectedKey = toDateKey(selectedDate);

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(selectedDate);

  const dayEvents = useMemo(
    () => events.filter((ev) => ev.date === selectedKey),
    [events, selectedKey]
  );

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="schedule-view">
      <div className="schedule-header">
        <h2 className="schedule-title">Расписание на день</h2>
        <div className="schedule-header-separator" />
        <div className="schedule-date">{formattedDate}</div>
        <div className="schedule-actions">
          <button type="button" className="schedule-action-btn" onClick={handlePrevDay} aria-label="Предыдущий день">
            <Icon icon="mdi:chevron-left" />
          </button>
          <button type="button" className="schedule-action-btn" onClick={handleNextDay} aria-label="Следующий день">
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
      </div>

      <div
        className="schedule-timeline"
        style={{ height: `${SCHEDULE_GRID_HEIGHT_PX}px` }}
      >
        {scheduleHours.map((h) => (
          <div
            key={h}
            className="schedule-timeline-row"
            style={{ height: SCHEDULE_SLOT_HEIGHT_PX }}
          >
            <div className="time-slot">{formatScheduleHour(h)}</div>
            <div className="schedule-timeline-track">
              <div className="schedule-hour-line" aria-hidden />
            </div>
          </div>
        ))}

        <div className="schedule-timeline-events">
          {dayEvents.map((ev) => {
            const { top, height } = getEventTimelinePositionPx(ev.startTime, ev.endTime);
            return (
              <ScheduleEventCard
                key={ev.id}
                event={ev}
                topPx={top}
                heightPx={height}
                onClick={onEventClick ? () => onEventClick(ev) : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
