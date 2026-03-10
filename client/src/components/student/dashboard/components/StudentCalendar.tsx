import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import '../student.css';

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

const StudentCalendar: React.FC = () => {
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
    <div className="student-cal">
      <div className="student-cal-header">
        <button
          className="student-cal-arrow"
          onClick={() => {
            const d = new Date(start);
            d.setDate(d.getDate() - 14);
            setStart(alignToMonday(d));
          }}
        >
          <Icon icon="mdi:chevron-left" />
        </button>
        <div className="student-cal-title">
          <span className="student-cal-year">{start.getFullYear()}</span>
          <span className="student-cal-month">{months[start.getMonth()]}</span>
        </div>
        <button
          className="student-cal-arrow"
          onClick={() => {
            const d = new Date(start);
            d.setDate(d.getDate() + 14);
            setStart(alignToMonday(d));
          }}
        >
          <Icon icon="mdi:chevron-right" />
        </button>
      </div>

      <div className="student-cal-grid">
        {days.map(d => (
          <div key={d} className="student-cal-day">{d}</div>
        ))}
      </div>

      <div className="student-cal-grid">
        {row1.map((d, i) => (
          <div key={`r1-${i}`} className={`student-cal-date ${d && ymd(d) === ymd(today) ? 'today' : ''}`}>
            {d ? d.getDate() : ''}
          </div>
        ))}
      </div>
      <div className="student-cal-grid">
        {row2.map((d, i) => (
          <div key={`r2-${i}`} className={`student-cal-date ${d && ymd(d) === ymd(today) ? 'today' : ''}`}>
            {d ? d.getDate() : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCalendar;
