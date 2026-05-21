import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Context } from '../../index';
import ScheduleEventCard from './ScheduleEventCard';
import { ScheduleEvent } from '../../types/scheduleEvent';
import { loadScheduleEvents } from '../../utils/scheduleEventsStorage';
import {
  findEventForHour,
  formatScheduleHour,
  getDashboardGridHeightPx,
  getEventDashboardPositionPx,
  scheduleHours,
  toDateKey,
} from '../../utils/scheduleHours';
import './DashboardSchedule.css';

type Props = {
  titleClassName: string;
  schedulePath: string;
};

const DashboardSchedule: React.FC<Props> = observer(({ titleClassName, schedulePath }) => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const userId = store.user?.id;
  const [events, setEvents] = useState<ScheduleEvent[]>([]);

  const todayKey = toDateKey(new Date());

  const todayEvents = useMemo(
    () => events.filter((ev) => ev.date === todayKey),
    [events, todayKey]
  );

  useEffect(() => {
    if (!userId) return;

    const reload = () => setEvents(loadScheduleEvents(userId));

    reload();
    window.addEventListener('schedule-events-updated', reload);
    window.addEventListener('focus', reload);

    return () => {
      window.removeEventListener('schedule-events-updated', reload);
      window.removeEventListener('focus', reload);
    };
  }, [userId]);

  const gridHeight = getDashboardGridHeightPx();

  return (
    <div className="dashboard-schedule">
      <div className={titleClassName}>Моё расписание</div>

      <div className="schedule-grid-wrap" style={{ height: gridHeight }}>
        <div className="schedule-grid">
          {scheduleHours.map((hour) => {
            const covered = findEventForHour(hour, todayEvents) != null;

            return (
              <div className="schedule-row" key={hour}>
                <div className="schedule-time">{formatScheduleHour(hour)}</div>
                <div className={`schedule-slot${covered ? ' schedule-slot--covered' : ''}`}>
                  {!covered && (
                    <button
                      type="button"
                      className="schedule-add"
                      aria-label="Добавить в расписание"
                      onClick={() => navigate(schedulePath)}
                    >
                      <Icon icon="ei:plus" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-schedule-events">
          {todayEvents.map((ev) => {
            const { top, height } = getEventDashboardPositionPx(ev.startTime, ev.endTime);
            return (
              <ScheduleEventCard
                key={ev.id}
                event={ev}
                topPx={top}
                heightPx={height}
                variant="dashboard"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default DashboardSchedule;
