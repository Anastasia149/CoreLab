import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../index';
import { useAppModal } from '../../context/AppModalContext';
import ScheduleView from '../teacher/schedule/ScheduleView';
import ScheduleEventPanel from './ScheduleEventPanel';
import ScheduleSidebar from './ScheduleSidebar';
import { ScheduleEvent } from '../../types/scheduleEvent';
import {
  createScheduleEvent,
  deleteScheduleEvent,
  fetchScheduleEvents,
  saveScheduleEventsToLocal,
  updateScheduleEvent,
} from '../../utils/scheduleEventsStorage';
import {
  disconnectGoogleCalendarSync,
  enableGoogleCalendarSync,
  fetchGoogleCalendarStatus,
  getApiErrorMessage,
  isEnableSyncComplete,
  isEnableSyncNeedsAuth,
  isEnableSyncNotConfigured,
  openGoogleOAuthPopup,
} from '../../services/googleCalendarService';
import '../teacher/schedule/ScheduleHome.css';
import './SchedulePage.css';

const GOOGLE_SETUP_MESSAGE =
  'Синхронизация с Google Calendar не настроена на сервере.\n\n' +
  '1. console.cloud.google.com → выберите проект\n' +
  '2. APIs & Services → Enable APIs → Google Calendar API\n' +
  '3. Credentials → Create Credentials → OAuth client ID → Web application\n' +
  '4. Origins: http://localhost:3000\n' +
  '5. Redirect URI: http://localhost:3000/google-calendar-callback\n' +
  '6. Скопируйте новый Client ID и Client Secret в server/.env\n' +
  '7. Перезапустите сервер (npm run dev в папке server).';

const GOOGLE_INVALID_CLIENT_MESSAGE =
  'Google не нашёл OAuth-клиент (invalid_client / client was not found).\n\n' +
  'Это значит, что GOOGLE_CLIENT_ID в server/.env не существует в Google Cloud или удалён.\n\n' +
  'Что сделать:\n' +
  '1. Откройте console.cloud.google.com → APIs & Services → Credentials\n' +
  '2. Убедитесь, что в списке есть OAuth 2.0 Client ID типа Web application\n' +
  '3. Если клиента нет — Create Credentials → OAuth client ID → Web application\n' +
  '4. Скопируйте новый Client ID и Client Secret в server/.env (без кавычек)\n' +
  '5. В Redirect URIs укажите: http://localhost:3000/google-calendar-callback\n' +
  '6. Перезапустите сервер и попробуйте снова\n\n' +
  'Важно: ID и Secret должны быть из одной строки в Credentials, не из разных клиентов.';

const SchedulePage: React.FC = observer(() => {
  const { store } = useContext(Context);
  const { showModal } = useAppModal();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
  const [calendarSyncLoading, setCalendarSyncLoading] = useState(false);
  const [calendarConfigured, setCalendarConfigured] = useState(false);

  const userId = store.user?.id != null ? String(store.user.id) : '';

  const refreshCalendarStatus = useCallback(async () => {
    if (!userId) {
      setCalendarSyncEnabled(false);
      return;
    }
    try {
      const status = await fetchGoogleCalendarStatus();
      setCalendarSyncEnabled(status.syncEnabled);
      setCalendarConfigured(status.configured);
    } catch {
      setCalendarSyncEnabled(false);
      setCalendarConfigured(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshCalendarStatus();
  }, [refreshCalendarStatus]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'google-calendar-connected') {
        setCalendarSyncEnabled(true);
        setCalendarSyncLoading(false);
        const synced = event.data.synced;
        if (typeof synced === 'number' && synced > 0) {
          void showModal(`Синхронизировано событий в Google Календарь: ${synced}`, {
            title: 'Google Календарь',
          });
        }
      }
      if (event.data?.type === 'google-calendar-error') {
        setCalendarSyncLoading(false);
        void showModal('Не удалось подключить Google Календарь.', { title: 'Ошибка' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [showModal]);

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

  const openCreatePanel = () => {
    setEditingEvent(null);
    setPanelOpen(true);
  };

  const openEditPanel = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingEvent(null);
  };

  const persistEventsLocally = (next: ScheduleEvent[]) => {
    if (!userId) return;
    setEvents(next);
    saveScheduleEventsToLocal(userId, next);
  };

  const handleSaveEvent = async (event: ScheduleEvent) => {
    if (!userId) return;

    const isUpdate = Boolean(editingEvent);

    try {
      if (isUpdate && editingEvent) {
        const updated = await updateScheduleEvent(editingEvent.id, event);
        if (updated) {
          setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
        } else {
          const next = events.map((ev) => (ev.id === event.id ? event : ev));
          persistEventsLocally(next);
        }
      } else {
        const created = await createScheduleEvent(event);
        if (created) {
          setEvents((prev) => [...prev, created]);
        } else {
          persistEventsLocally([...events, event]);
        }
      }
    } catch (e) {
      console.log(`FULL ERROR (${isUpdate ? 'update' : 'create'} schedule event):`, e);
      if (isUpdate) {
        const next = events.map((ev) => (ev.id === event.id ? event : ev));
        persistEventsLocally(next);
      } else {
        persistEventsLocally([...events, event]);
      }
    }

    window.dispatchEvent(new Event('schedule-events-updated'));
    closePanel();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!userId) return;

    try {
      await deleteScheduleEvent(eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (e) {
      console.log('FULL ERROR (delete schedule event):', e);
      const next = events.filter((ev) => ev.id !== eventId);
      persistEventsLocally(next);
    }

    window.dispatchEvent(new Event('schedule-events-updated'));
    closePanel();
  };

  const handleCalendarSyncToggle = async () => {
    if (!userId || calendarSyncLoading) return;

    setCalendarSyncLoading(true);
    try {
      if (calendarSyncEnabled) {
        await disconnectGoogleCalendarSync();
        setCalendarSyncEnabled(false);
        return;
      }

      if (!calendarConfigured) {
        await showModal(GOOGLE_SETUP_MESSAGE, { title: 'Настройка Google Calendar' });
        return;
      }

      const result = await enableGoogleCalendarSync();

      if (isEnableSyncNotConfigured(result)) {
        await showModal(result.message, { title: 'Google Calendar' });
        return;
      }

      if (isEnableSyncNeedsAuth(result)) {
        const popup = openGoogleOAuthPopup(result.url);
        if (!popup) {
          await showModal('Разрешите всплывающие окна для подключения Google Календаря.', {
            title: 'Подключение',
          });
        }
        return;
      }

      if (isEnableSyncComplete(result)) {
        setCalendarSyncEnabled(true);
        if (result.synced > 0) {
          await showModal(`Синхронизировано событий в Google Календарь: ${result.synced}`, {
            title: 'Готово',
          });
        }
      }
    } catch (e) {
      console.log('FULL ERROR (google calendar sync):', e);
      const apiMessage = getApiErrorMessage(e, '');
      const isInvalidClient =
        apiMessage.includes('invalid_client') ||
        apiMessage.toLowerCase().includes('oauth client') ||
        apiMessage.toLowerCase().includes('не найден');

      await showModal(isInvalidClient ? GOOGLE_INVALID_CLIENT_MESSAGE : apiMessage || GOOGLE_INVALID_CLIENT_MESSAGE, {
        title: 'Ошибка Google',
      });
    } finally {
      setCalendarSyncLoading(false);
    }
  };

  return (
    <div className={`schedule-home schedule-page${panelOpen ? ' schedule-page--panel-open' : ''}`}>
      <div className="schedule-main-column">
        <button
          type="button"
          className="schedule-add-event-btn schedule-add-event-btn--above"
          onClick={openCreatePanel}
        >
          <Icon icon="mdi:plus" />
          Добавить событие
        </button>
        <ScheduleView
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          events={events}
          onEventClick={openEditPanel}
        />
      </div>
      <ScheduleSidebar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onAddEvent={openCreatePanel}
        calendarSyncEnabled={calendarSyncEnabled}
        calendarSyncLoading={calendarSyncLoading}
        onCalendarSyncToggle={handleCalendarSyncToggle}
        courses={courses}
        events={events}
      />
      {panelOpen && (
        <ScheduleEventPanel
          selectedDate={selectedDate}
          courses={courses}
          editingEvent={editingEvent}
          onClose={closePanel}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? handleDeleteEvent : undefined}
        />
      )}
    </div>
  );
});

export default SchedulePage;
