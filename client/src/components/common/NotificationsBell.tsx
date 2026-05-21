import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { NotificationItem } from '../../types/notification';
import './NotificationsBell.css';

type Props = {
  iconButtonClassName: string;
  notifications?: NotificationItem[];
};

const NotificationsBell: React.FC<Props> = ({
  iconButtonClassName,
  notifications = [],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="notifications-bell" ref={rootRef}>
      <button
        type="button"
        className={`${iconButtonClassName}${open ? ' notifications-bell-btn--active' : ''}`}
        aria-label="Уведомления"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon icon="solar:bell-linear" />
      </button>

      {open && (
        <div
          className="notifications-panel"
          role="dialog"
          aria-label="Уведомления"
        >
          <div className="notifications-panel-head">
            <h2 className="notifications-panel-title">Уведомления</h2>
          </div>

          {notifications.length === 0 ? (
            <p className="notifications-panel-empty">У вас нет уведомлений</p>
          ) : (
            <ul className="notifications-panel-list">
              {notifications.map((item) => (
                <li key={item.id} className="notifications-panel-item">
                  <span className="notifications-panel-icon" aria-hidden>
                    <Icon icon={item.icon} />
                  </span>
                  <div className="notifications-panel-body">
                    <p className="notifications-panel-text">{item.message}</p>
                    <time className="notifications-panel-time">{item.timeAgo}</time>
                  </div>
                  <button
                    type="button"
                    className="notifications-panel-menu"
                    aria-label="Действия с уведомлением"
                  >
                    <Icon icon="mdi:dots-vertical" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
