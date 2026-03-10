import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import '../teacher.css';

const months = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
];
const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function ymd(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function alignToMonday(date: Date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d;
}

const TeacherCalendar: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [start, setStart] = useState<Date>(alignToMonday(new Date(today.getFullYear(), today.getMonth(), today.getDate())));

  const week1 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const start2 = new Date(start);
  start2.setDate(start2.getDate() + 7);
  const week2 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start2);
    d.setDate(start2.getDate() + i);
    return d;
  });

  function idx(d: Date) {
    return (d.getDay() + 6) % 7;
  }

  function rowFor(week: Date[]) {
    const map = new Map<number, Date>();
    week.forEach(d => map.set(idx(d), d));
    return days.map((_, i) => map.get(i) || null);
  }

  const row1 = rowFor(week1);
  const row2 = rowFor(week2);

  return (
    <div className="teacher-cal">
      <div className="teacher-cal-header">
        <button
          className="teacher-cal-arrow"
          onClick={() => {
            const d = new Date(start);
            d.setDate(d.getDate() - 14);
            setStart(alignToMonday(d));
          }}
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        <div className="teacher-cal-title">
          <span className="teacher-cal-year">{start.getFullYear()}</span>
          <span className="teacher-cal-month">{months[start.getMonth()]}</span>
        </div>
        <button
          className="teacher-cal-arrow"
          onClick={() => {
            const d = new Date(start);
            d.setDate(d.getDate() + 14);
            setStart(alignToMonday(d));
          }}
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <div className="teacher-cal-grid">
        {days.map(d => (
          <div key={d} className="teacher-cal-day">{d}</div>
        ))}
      </div>

      <div className="teacher-cal-grid">
        {row1.map((d, i) => (
          <div key={`r1-${i}`} className={`teacher-cal-date ${d && ymd(d) === ymd(today) ? 'today' : ''}`}>
            {d ? d.getDate() : ''}
          </div>
        ))}
      </div>
      <div className="teacher-cal-grid">
        {row2.map((d, i) => (
          <div key={`r2-${i}`} className={`teacher-cal-date ${d && ymd(d) === ymd(today) ? 'today' : ''}`}>
            {d ? d.getDate() : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCalendar;
