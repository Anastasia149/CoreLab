import React from 'react';
import { Icon } from '@iconify/react';
import '../student.css';

const hours = Array.from({ length: 15 }, (_, i) => i + 8);

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const StudentSchedule: React.FC = () => {
  return (
    <div className="student-schedule">
      <div className="student-section-title">Моё расписание</div>
      <div className="schedule-grid">
        {hours.map(h => (
          <div className="schedule-row" key={h}>
            <div className="schedule-time">{pad(h)}:00</div>
            <div className="schedule-slot">
              <button className="schedule-add" aria-label="Добавить в расписание">
                <Icon icon="ei:plus" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentSchedule;
