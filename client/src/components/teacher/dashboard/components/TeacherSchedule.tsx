import React from 'react';
import DashboardSchedule from '../../../schedule/DashboardSchedule';
import './TeacherSchedule.css';

const TeacherSchedule: React.FC = () => (
  <div className="teacher-schedule">
    <DashboardSchedule
      titleClassName="teacher-section-title"
      schedulePath="/teacher?tab=schedule"
    />
  </div>
);

export default TeacherSchedule;
