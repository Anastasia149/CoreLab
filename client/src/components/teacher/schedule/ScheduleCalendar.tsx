import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { toDateKey } from '../../../utils/scheduleHours';
import './ScheduleCalendar.css';

const months = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];
const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function ymd(d: Date) {
  return toDateKey(d);
}

function alignToMonday(date: Date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

const ScheduleCalendar: React.FC<Props> = ({ selectedDate, onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const weeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfGrid = alignToMonday(firstDayOfMonth);

    const allWeeks = [];
    let currentDay = new Date(firstDayOfGrid);

    while (currentDay <= lastDayOfMonth || allWeeks.length < 6) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDay));
        currentDay.setDate(currentDay.getDate() + 1);
      }
      allWeeks.push(week);
      if (currentDay > lastDayOfMonth && (currentDay.getDay() + 6) % 7 === 0) {
        break;
      }
    }
    return allWeeks;
  }, [currentDate]);

  const handlePrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="schedule-cal">
      <div className="schedule-cal-header">
        <button className="schedule-cal-arrow" onClick={handlePrev}>
          <Icon icon="mdi:chevron-left" />
        </button>
        <div className="schedule-cal-title">
          <span className="schedule-cal-year">{currentDate.getFullYear()}</span>
          <span className="schedule-cal-month">{months[currentDate.getMonth()]}</span>
        </div>
        <button className="schedule-cal-arrow" onClick={handleNext}>
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <div className="schedule-cal-grid">
        {days.map(d => (
          <div key={d} className="schedule-cal-day">{d}</div>
        ))}
      </div>

      {weeks.map((week, i) => (
        <div key={i} className="schedule-cal-grid">
          {week.map((d, j) => (
            <div
              key={j}
              className={`schedule-cal-date ${d && ymd(d) === ymd(selectedDate) ? 'today' : ''} ${d.getMonth() !== currentDate.getMonth() ? 'other-month' : ''}`}
              onClick={() => d && onDateChange(d)}
            >
              {d ? d.getDate() : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ScheduleCalendar;
