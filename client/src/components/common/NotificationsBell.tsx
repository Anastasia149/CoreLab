import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../index';
import { NotificationItem } from '../../types/notification';
import './NotificationsBell.css';

type Props = {
  iconButtonClassName: string;
};

const POLL_MS = 60_000;

const NotificationsBell: React.FC<Props> = observer(({ iconButtonClassName }) => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hadNotificationsRef = useRef(false);

  const notifications = store.notifications;
  const unreadCount = store.unreadNotificationsCount;
  const isTeacher = store.user?.role === 'teacher';

  useEffect(() => {
    if (!store.isAuth) return;
    void store.fetchNotifications();
    const id = window.setInterval(() => {
      void store.fetchNotifications();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [store.isAuth, store]);

  const closePanel = useCallback(async () => {
    if (isTeacher && hadNotificationsRef.current) {
      await store.deleteAllNotifications();
    }
    hadNotificationsRef.current = false;
    setOpen(false);
  }, [isTeacher, store]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        void closePanel();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void closePanel();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closePanel]);

  const handleToggle = useCallback(async () => {
    if (open) {
      await closePanel();
      return;
    }

    await store.fetchNotifications();
    hadNotificationsRef.current = store.notifications.length > 0;
    setOpen(true);
  }, [open, store, closePanel]);

  const isNotificationClickable = (item: NotificationItem) =>
    (store.user?.role === 'teacher' && (!!item.lessonId || !!item.courseId)) ||
    (store.user?.role === 'student' && !!item.lessonId);

  const handleItemClick = async (item: NotificationItem) => {
    if (!isNotificationClickable(item)) return;

    if (store.user?.role === 'student' && item.lessonId) {
      await store.deleteNotification(item.id);
      setOpen(false);
      navigate(`/student/lesson/${item.lessonId}`);
      return;
    }

    if (store.user?.role === 'teacher') {
      await closePanel();
      if (item.lessonId) {
        const openComments =
          item.message.includes('комментарий') ||
          item.message.includes('комментарии');
        navigate(`/teacher/lesson/${item.lessonId}`, {
          state: openComments ? { openComments: true } : undefined,
        });
      } else if (item.courseId) {
        navigate(`/teacher/course/${item.courseId}`);
      }
    }
  };

  const badgeLabel =
    unreadCount > 99 ? '99+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="notifications-bell" ref={rootRef}>
      <button
        type="button"
        className={`${iconButtonClassName}${open ? ' notifications-bell-btn--active' : ''}`}
        aria-label={
          unreadCount > 0
            ? `Уведомления: ${unreadCount} непрочитанных`
            : 'Уведомления'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => void handleToggle()}
      >
        <Icon icon="solar:bell-linear" />
        {badgeLabel && (
          <span className="notifications-badge" aria-hidden>
            {badgeLabel}
          </span>
        )}
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
                <li key={item.id}>
                  <button
                    type="button"
                    className={`notifications-panel-item${
                      item.isRead === false ? ' notifications-panel-item--unread' : ''
                    }${isNotificationClickable(item) ? ' notifications-panel-item--clickable' : ''}`}
                    onClick={() => void handleItemClick(item)}
                    disabled={!isNotificationClickable(item)}
                  >
                    <span className="notifications-panel-icon" aria-hidden>
                      <Icon icon={item.icon} />
                    </span>
                    <div className="notifications-panel-body">
                      <p className="notifications-panel-text">{item.message}</p>
                      <time className="notifications-panel-time">{item.timeAgo}</time>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
});

export default NotificationsBell;
