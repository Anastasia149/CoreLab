import React, { useContext } from 'react';
import { Icon } from '@iconify/react';
import '../student.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Context } from '../../../../index';

type Props = {
  name?: string;
};

const StudentHeader: React.FC<Props> = ({ name }) => {
  const navigate = useNavigate();
  const location = useLocation();
  useContext(Context);

  const getTitle = () => {
    const path = location.pathname;
    const pathParts = path.split('/').filter(p => p);

    if (path.startsWith('/student/courses') && pathParts.length === 3) {
      return 'Детали';
    }
    if (path.startsWith('/student/courses')) {
      return 'Поиск';
    }
    if (path.startsWith('/student/schedule')) {
      return 'Расписание';
    }
    if (path.startsWith('/student/settings')) {
      return 'Настройки';
    }
    return 'Главная';
  };

  const title = getTitle();

  const openSettings = () => navigate('/student/settings');
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
        <button className="student-icon-btn" aria-label="Уведомления">
          <Icon icon="solar:bell-linear" />
        </button>
        <button className="student-icon-btn" aria-label="Корзина">
          <Icon icon="streamline-ultimate:shopping-basket-1" />
        </button>
        <div className="student-avatar" onClick={openSettings} role="button" aria-label="Открыть настройки" tabIndex={0}>
          <Icon icon="solar:user-linear" />
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;
