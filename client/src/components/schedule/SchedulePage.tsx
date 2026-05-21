import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import ScheduleView from '../teacher/schedule/ScheduleView';
import ScheduleEventPanel from './ScheduleEventPanel';
import ScheduleSidebar from './ScheduleSidebar';
import { ScheduleEvent } from '../../types/scheduleEvent';
import { loadScheduleEvents, saveScheduleEvents } from '../../utils/scheduleEventsStorage';
import '../teacher/schedule/ScheduleHome.css';
import './SchedulePage.css';

const SchedulePage: React.FC = observer(() => {
  const { store } = useContext(Context);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panelOpen, setPanelOpen] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const userId = store.user?.id;

  useEffect(() => {
    if (store.user?.role === 'teacher') {
      store.getTeacherCourses();
    }
  }, [store]);

  useEffect(() => {
    if (userId) {
      setEvents(loadScheduleEvents(userId));
    }
  }, [userId]);

  const courses = useMemo(() => {
    if (store.user?.role === 'teacher') {
      return store.courses;
    }
    return store.user?.courses ?? [];
  }, [store.user?.role, store.courses, store.user?.courses]);

  const handleSaveEvent = (event: ScheduleEvent) => {
    if (!userId) return;
    const next = [...events, event];
    setEvents(next);
    saveScheduleEvents(userId, next);
    window.dispatchEvent(new Event('schedule-events-updated'));
    setPanelOpen(false);
  };

  return (
    <div className={`schedule-home schedule-page${panelOpen ? ' schedule-page--panel-open' : ''}`}>
      <ScheduleView
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        events={events}
      />
      <ScheduleSidebar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAddEvent={() => setPanelOpen(true)}
        courses={courses}
        events={events}
      />
      {panelOpen && (
        <ScheduleEventPanel
          selectedDate={selectedDate}
          courses={courses}
          onClose={() => setPanelOpen(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
});

export default SchedulePage;
