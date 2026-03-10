import React, { useState } from 'react';
import './schedule.css';
import ScheduleCalendar from '../schedule/ScheduleCalendar';
import ScheduleView from '../schedule/ScheduleView';
import ScheduleCategoryList from '../schedule/ScheduleCategoryList';

const ScheduleHome: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="schedule-home">
      <ScheduleView selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <div className="schedule-sidebar">
        <ScheduleCalendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
        <ScheduleCategoryList />
      </div>
    </div>
  );
};

export default ScheduleHome;
