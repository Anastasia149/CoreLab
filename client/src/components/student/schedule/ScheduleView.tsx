import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import './ScheduleView.css';
import { formatScheduleHour, scheduleHours } from '../../../utils/scheduleHours';

function alignToMonday(date: Date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const ScheduleView: React.FC<Props> = ({ selectedDate, onDateChange }) => {
  const formattedDate = new Intl.DateTimeFormat('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }).format(selectedDate);

  const weekDays = useMemo(() => {
    const startOfWeek = alignToMonday(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  return (
    <div className="schedule-view">
      <div className="schedule-header">
        <h2 className="schedule-title">Планируемые задачи</h2>
        <div className="schedule-header-separator"></div>
        <div className="schedule-date">{formattedDate}</div>
        <div className="schedule-actions">
          <button className="schedule-action-btn" onClick={handlePrevWeek}><Icon icon="mdi:chevron-left" /></button>
          <button className="schedule-action-btn" onClick={handleNextWeek}><Icon icon="mdi:chevron-right" /></button>
        </div>
      </div>

      <div className="schedule-body-grid">
        <div className="time-header-label">время</div>
        <div className="week-view">
          {weekDays.map((day, index) => (
            <div
              key={day.toISOString()}
              className={`week-day ${ymd(day) === ymd(selectedDate) ? 'active' : ''}`}
              onClick={() => onDateChange(day)}
            >
              <div className="week-day-name">{dayNames[index]}</div>
              <div className="week-day-date">{day.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="time-scale">
          {scheduleHours.map(h => (
            <div key={h} className="time-slot">{formatScheduleHour(h)}</div>
          ))}
        </div>
        <div className="schedule-events">
          {scheduleHours.map(h => (
            <div key={h} className="schedule-event-row">&nbsp;</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
