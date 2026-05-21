import React from 'react';
import { Icon } from '@iconify/react';
import './TeacherSchedule.css';
import { formatScheduleHour, scheduleHours } from '../../../../utils/scheduleHours';

const TeacherSchedule: React.FC = () => {
  return (
    <div className="teacher-schedule">
      <div className="teacher-section-title">Моё расписание</div>
      <div className="schedule-grid">
        {scheduleHours.map(h => (
          <div className="schedule-row" key={h}>
            <div className="schedule-time">{formatScheduleHour(h)}</div>
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

export default TeacherSchedule;
