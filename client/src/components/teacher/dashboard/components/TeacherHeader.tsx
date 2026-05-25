import React, { useContext } from 'react';
import { Icon } from '@iconify/react';
import './TeacherHeader.css';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Context } from '../../../../index';
import { observer } from 'mobx-react-lite';
import NotificationsBell from '../../../common/NotificationsBell';
import { useSidebarDrawer } from '../../../../context/SidebarDrawerContext';

type Props = {
  name?: string;
};

const TeacherHeader = observer(({ name }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { store } = useContext(Context);

  const userDisplayName = store.user?.name;

  const getTitle = () => {
    const tab = searchParams.get('tab');
    const path = location.pathname;
    const isTeacherHome = path === '/teacher' || path === '/teacher/';

    if (isTeacherHome) {
      if (tab === 'schedule') return 'Расписание';
      if (tab === 'settings') return 'Настройки';
      return 'Главная';
    }

    if (path.startsWith('/teacher/courses')) return 'Мои курсы';
    if (path.includes('/student/')) return name || 'Профиль ученика';
    if (path.startsWith('/teacher/course/')) return name || 'Детали курса';
    if (path.startsWith('/teacher/create-course')) return 'Создание курса';
    if (path.startsWith('/teacher/lesson/')) return name || 'Урок';
    
    if (path.startsWith('/teacher/profile')) return 'Профиль';

    return 'Главная';
  };

  const title = getTitle();
  const { isOpen, toggle: toggleSidebar } = useSidebarDrawer();
  const isHome = title === 'Главная';
  const avatarUrl = store.user?.avatar;

  const openProfile = () => navigate('/teacher/profile');

  const onAvatarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProfile();
    }
  };

  return (
    <div className="teacher-header">
      <div className="teacher-header-title">
        <button
          type="button"
          className="teacher-header-menu-btn"
          aria-label="Открыть меню"
          aria-expanded={isOpen}
          onClick={toggleSidebar}
        >
          <Icon icon="mdi:menu" aria-hidden />
        </button>
        <div className="teacher-header-title-text">
          <div className="teacher-hello">{title}</div>
          {isHome && userDisplayName && (
            <div className="teacher-hello-sub">Добро пожаловать, {userDisplayName}!</div>
          )}
        </div>
      </div>
      <div className="teacher-header-actions">
        <NotificationsBell iconButtonClassName="teacher-icon-btn" />
        <div
          className="teacher-avatar"
          onClick={openProfile}
          onKeyDown={onAvatarKeyDown}
          role="button"
          aria-label="Профиль: сменить фото, имя и почту"
          tabIndex={0}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="teacher-avatar-img" />
          ) : (
            <Icon icon="solar:user-linear" />
          )}
        </div>
      </div>
    </div>
  );
});

export default TeacherHeader;
