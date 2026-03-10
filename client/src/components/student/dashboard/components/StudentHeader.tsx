import React, { useContext } from 'react';
import { Icon } from '@iconify/react';
import '../student.css';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../../index';

type Props = {
  name?: string;
  tab?: string;
};

const StudentHeader: React.FC<Props> = ({ name, tab }) => {
  const navigate = useNavigate();
  useContext(Context);

  const openSettings = () => navigate('/student?tab=settings');
  return (
    <div className="student-header">
      <div className="student-header-title">
        {tab === 'schedule' ? (
          <div className="student-hello">Расписание</div>
        ) : (
          <>
            <div className="student-hello">Добро пожаловать{name ? `, ${name}!` : '!'}</div>
            <div className="student-hello-sub">Продолжайте заниматься</div>
          </>
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
