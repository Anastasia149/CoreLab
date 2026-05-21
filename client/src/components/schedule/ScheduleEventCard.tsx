import React from 'react';
import { Icon } from '@iconify/react';
import { ScheduleEvent } from '../../types/scheduleEvent';
import { getCourseColorTint } from '../../utils/scheduleCourseColors';
import './ScheduleEventCard.css';

type Props = {
  event: ScheduleEvent;
  topPercent?: number;
  heightPercent?: number;
  topPx?: number;
  heightPx?: number;
  compact?: boolean;
  variant?: 'default' | 'dashboard';
  layout?: 'overlay' | 'slot';
};

const ScheduleEventCard: React.FC<Props> = ({
  event,
  topPercent,
  heightPercent,
  topPx,
  heightPx,
  compact,
  variant = 'default',
  layout = 'overlay',
}) => {
  const isDashboard = variant === 'dashboard';

  const hasPx =
    topPx != null &&
    heightPx != null &&
    Number.isFinite(topPx) &&
    Number.isFinite(heightPx);
  const hasPercent =
    layout === 'overlay' &&
    topPercent != null &&
    heightPercent != null &&
    Number.isFinite(topPercent) &&
    Number.isFinite(heightPercent);

  const positionStyle = hasPx
    ? { top: `${topPx}px`, height: `${Math.max(heightPx, 44)}px` }
    : hasPercent
      ? { top: `${topPercent}%`, height: `${Math.max(heightPercent, 4)}%` }
      : { top: 0, height: '48px' };

  const className = [
    'schedule-event-card',
    compact && !isDashboard ? 'schedule-event-card--compact' : '',
    isDashboard ? 'schedule-event-card--dashboard' : '',
    layout === 'slot' ? 'schedule-event-card--slot' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      style={{
        ...positionStyle,
        background: getCourseColorTint(event.courseColor, isDashboard ? 0.22 : 0.14),
        borderColor: isDashboard ? 'transparent' : event.courseColor,
        ['--event-accent' as string]: event.courseColor,
      }}
      title={`${event.title} (${event.startTime} – ${event.endTime})`}
    >
      <div className="schedule-event-card-top">
        {!isDashboard && (
          <span
            className="schedule-event-card-dot"
            style={{ background: event.courseColor }}
            aria-hidden
          />
        )}
        <span className="schedule-event-card-course">{event.courseTitle}</span>
        <button type="button" className="schedule-event-card-menu" aria-label="Меню события" tabIndex={-1}>
          <Icon icon="mdi:dots-horizontal" />
        </button>
      </div>
      <div className="schedule-event-card-title">{event.title}</div>
      <div className="schedule-event-card-time">
        {event.startTime} – {event.endTime}
      </div>
    </article>
  );
};

export default ScheduleEventCard;
