import React, { useContext } from 'react';
import { Icon } from '@iconify/react';
import '../teacher.css';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../../index';
import { observer } from 'mobx-react-lite';

type Props = {
  name?: string;
  tab?: string;
};

const TeacherHeader = observer(({ name, tab }: Props) => {
  const navigate = useNavigate();
  const { store } = useContext(Context);

  const userDisplayName = store.user?.name;

  const openSettings = () => navigate('/teacher?tab=settings');
  return (
    <div className="teacher-header">
      <div className="teacher-header-title">
        {(!tab || tab === 'dashboard') && userDisplayName ? (
          <div className="teacher-hello">Добро пожаловать, {userDisplayName}!</div>
        ) : tab === 'schedule' ? (
          <div className="teacher-hello">Расписание</div>
        ) : tab === 'courses' ? (
          <div className="teacher-hello">Мои курсы</div>
        ) : name && name !== userDisplayName ? (
          <div className="teacher-hello">{name}</div>
        ) : userDisplayName ? (
          <div className="teacher-hello">Добро пожаловать, {userDisplayName}!</div>
        ) : (
          <>
            <div className="teacher-hello">Добро пожаловать!</div>
            <div className="teacher-hello-sub">Хорошего дня!</div>
          </>
        )}
      </div>
      <div className="teacher-header-actions">
        <button className="teacher-icon-btn" aria-label="Поиск">
          <Icon icon="si:search-line" />
        </button>
        <button className="teacher-icon-btn" aria-label="Уведомления">
          <Icon icon="solar:bell-linear" />
        </button>
        <div className="teacher-avatar" onClick={openSettings} role="button" aria-label="Открыть настройки" tabIndex={0}>
          <Icon icon="solar:user-linear" />
        </div>
      </div>
    </div>
  );
});

export default TeacherHeader;
