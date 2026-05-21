import React, { useContext, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import './StudentHeader.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Context } from '../../../../index';
import { observer } from 'mobx-react-lite';
import { getLessonTypeLabel } from '../../../../utils/lessonTypeDisplay';
import NotificationsBell from '../../../common/NotificationsBell';

type Props = {
  name?: string;
};

const StudentHeader: React.FC<Props> = observer(({ name }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { store } = useContext(Context);

  const lessonIdMatch = location.pathname.match(/^\/student\/lesson\/(\d+)\/?$/);
  const lessonIdFromPath = lessonIdMatch?.[1] ?? null;
  const [lessonTypeHeader, setLessonTypeHeader] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonIdFromPath) {
      setLessonTypeHeader(null);
      return;
    }
    setLessonTypeHeader(null);
    let cancelled = false;
    store.getLesson(lessonIdFromPath).then((l) => {
      if (!cancelled && l) {
        setLessonTypeHeader(getLessonTypeLabel(l.type));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lessonIdFromPath, store]);

  const getTitle = () => {
    const path = location.pathname;
    const pathParts = path.split('/').filter(p => p);

    if (path === '/student') {
      return 'Главная';
    }
    if (path.startsWith('/student/my-courses')) {
      return 'Мои курсы';
    }
    if (path.startsWith('/student/search')) {
      return 'Поиск курсов';
    }
    if (path.startsWith('/student/courses/') && pathParts.length === 3) {
      return 'Детали курса';
    }
    if (path.startsWith('/student/schedule')) {
      return 'Расписание';
    }
    if (path.startsWith('/student/profile')) {
      return 'Профиль';
    }
    if (path.startsWith('/student/cart')) {
      return 'Корзина';
    }
    if (path.startsWith('/student/billing')) {
      return 'Оплата';
    }
    if (path.startsWith('/student/lesson/')) {
      return lessonTypeHeader ?? 'Загрузка…';
    }
    return 'Главная';
  };

  const title = getTitle();

  const openProfile = () => navigate('/student/profile');
  const openCart = () => navigate('/student/cart');
  const avatarUrl = store.user?.avatar;

  const onAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProfile();
    }
  };

  return (
    <div className="student-header">
      <div className="student-header-title">
        <div className="student-hello">{title}</div>
        {title === 'Главная' && (
          <div className="student-hello-sub">Добро пожаловать{name ? `, ${name}!` : '!'}</div>
        )}
      </div>
      <div className="student-header-actions">
        <button className="student-icon-btn" aria-label="Поиск">
          <Icon icon="si:search-line" />
        </button>
        <NotificationsBell iconButtonClassName="student-icon-btn" />
        <button type="button" className="student-icon-btn" aria-label="Корзина" onClick={openCart}>
          <Icon icon="streamline-ultimate:shopping-basket-1" />
        </button>
        <div
          className="student-avatar"
          onClick={openProfile}
          onKeyDown={onAvatarKeyDown}
          role="button"
          aria-label="Профиль: сменить фото, имя и почту"
          tabIndex={0}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="student-avatar-img" />
          ) : (
            <Icon icon="solar:user-linear" />
          )}
        </div>
      </div>
    </div>
  );
});

export default StudentHeader;
