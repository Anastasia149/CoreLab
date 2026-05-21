import React from 'react';
import DashboardSchedule from '../../../schedule/DashboardSchedule';
import './StudentSchedule.css';

const StudentSchedule: React.FC = () => (
  <div className="student-schedule">
    <DashboardSchedule
      titleClassName="student-section-title"
      schedulePath="/student/schedule"
    />
  </div>
);

export default StudentSchedule;
