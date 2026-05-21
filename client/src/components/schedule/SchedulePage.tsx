import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import ScheduleView from '../teacher/schedule/ScheduleView';
import ScheduleEventPanel from './ScheduleEventPanel';
import ScheduleSidebar from './ScheduleSidebar';
import { ScheduleEvent } from '../../types/scheduleEvent';
import {
  createScheduleEvent,
  fetchScheduleEvents,
  saveScheduleEventsToLocal,
} from '../../utils/scheduleEventsStorage';
import '../teacher/schedule/ScheduleHome.css';
import './SchedulePage.css';

const SchedulePage: React.FC = observer(() => {
  const { store } = useContext(Context);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panelOpen, setPanelOpen] = useState(false);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const userId = store.user?.id != null ? String(store.user.id) : '';

  useEffect(() => {
    if (store.user?.role === 'teacher') {
      store.getTeacherCourses();
    } else if (store.user?.role === 'student') {
      store.refreshMyCourses();
    }
  }, [store]);

  useEffect(() => {
    if (!userId) return;

    const reload = async () => {
      const list = await fetchScheduleEvents(userId);
      setEvents(list);
    };
    reload();

    window.addEventListener('schedule-events-updated', reload);
    window.addEventListener('focus', reload);

    return () => {
      window.removeEventListener('schedule-events-updated', reload);
      window.removeEventListener('focus', reload);
    };
  }, [userId]);

  const courses = useMemo(() => {
    if (store.user?.role === 'teacher') {
      return store.courses;
    }
    return store.user?.courses ?? [];
  }, [store.user?.role, store.courses, store.user?.courses]);

  const handleSaveEvent = async (event: ScheduleEvent) => {
    if (!userId) return;
    try {
      const created = await createScheduleEvent(event);
      if (created) {
        setEvents((prev) => [...prev, created]);
      } else {
        const next = [...events, event];
        setEvents(next);
        saveScheduleEventsToLocal(userId, next);
      }
    } catch (e) {
      console.log('FULL ERROR (create schedule event):', e);
      const next = [...events, event];
      setEvents(next);
      saveScheduleEventsToLocal(userId, next);
    }
    window.dispatchEvent(new Event('schedule-events-updated'));
    setPanelOpen(false);
  };

  return (
    <div className={`schedule-home schedule-page${panelOpen ? ' schedule-page--panel-open' : ''}`}>
      <div className="schedule-main-column">
        <button
          type="button"
          className="schedule-add-event-btn schedule-add-event-btn--above"
          onClick={() => setPanelOpen(true)}
        >
          <Icon icon="mdi:plus" />
          Добавить событие
        </button>
        <ScheduleView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          events={events}
        />
      </div>
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
