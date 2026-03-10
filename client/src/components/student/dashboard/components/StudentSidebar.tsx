import React from 'react';
import { Icon } from '@iconify/react';
import '../student.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

const primary = [
  { icon: 'hugeicons:menu-square', label: 'Главная', tab: 'dashboard' },
  { icon: 'mdi:calendar-outline', label: 'Расписание', tab: 'schedule' },
  { icon: 'mdi:forum-outline', label: 'Форум', tab: 'forum' },
  { icon: 'mdi:credit-card-outline', label: 'Оплата', tab: 'billing' },
];

const courses = [
  { icon: 'mdi:folder-outline', label: 'Мои курсы', tab: 'courses' },
  { icon: 'hugeicons:internet', label: 'Поиск', tab: 'search' },
];

const other = [
  { icon: 'mdi:help-circle-outline', label: 'Поддержка', tab: 'support' },
  { icon: 'mdi:cog-outline', label: 'Настройки', tab: 'settings' },
];

const StudentSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setTab = (tab: string) => setSearchParams({ tab });
  return (
    <aside className="student-sidebar">
      <div className="student-brand" onClick={() => navigate('/')}>
        <Icon icon="icomoon-free:book" className="student-brand-icon" />
        <div className="student-brand-text">Courses</div>
      </div>
      <div className="student-nav-section-title">Основное</div>
      <nav className="student-nav">
        {primary.map((it) => (
          <button
            className={`student-nav-item ${activeTab === it.tab ? 'active' : ''}`}
            key={it.label}
            onClick={() => setTab(it.tab)}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="student-nav-section-title">Курсы</div>
      <nav className="student-nav">
        {courses.map(it => (
          <button
            className={`student-nav-item ${activeTab === it.tab ? 'active' : ''}`}
            key={it.label}
            onClick={() => setTab(it.tab)}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="student-nav-section-title">Другое</div>
      <nav className="student-nav">
        {other.map(it => (
          <button
            className={`student-nav-item ${activeTab === it.tab ? 'active' : ''}`}
            key={it.label}
            onClick={() => setTab(it.tab)}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default StudentSidebar;
