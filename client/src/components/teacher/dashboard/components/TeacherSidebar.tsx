import React from 'react';
import { Icon } from '@iconify/react';
import './TeacherSidebar.css';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const primary = [
  { icon: 'hugeicons:menu-square', label: 'Главная', tab: 'dashboard' },
  { icon: 'mdi:calendar-outline', label: 'Расписание', tab: 'schedule' },
  { icon: 'mdi:forum-outline', label: 'Форум', tab: 'forum' },
  { icon: 'mdi:folder-outline', label: 'Мои курсы', tab: 'courses' },
];

const other = [
  { icon: 'mdi:help-circle-outline', label: 'Поддержка', tab: 'support' },
  { icon: 'mdi:cog-outline', label: 'Настройки', tab: 'settings' },
];

const TeacherSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeTab = (location.pathname.startsWith('/teacher/course') || location.pathname.startsWith('/teacher/lesson') || location.pathname === '/teacher/courses' || location.pathname === '/teacher/create-course') ? 'courses' : searchParams.get('tab') || 'dashboard';
  const setTab = (tab: string) => {
    if (tab === 'courses') {
      navigate('/teacher/courses');
    } else {
      navigate(`/teacher?tab=${tab}`);
    }
  };
  return (
    <aside className="teacher-sidebar">
      <div className="teacher-brand" onClick={() => navigate('/')}>
        <Icon icon="icomoon-free:book" className="teacher-brand-icon" />
        <div className="teacher-brand-text">CoreLab</div>
      </div>
      <div className="teacher-nav-section-title">Основное</div>
      <nav className="teacher-nav">
        {primary.map((it) => (
          <button
            className={`teacher-nav-item ${activeTab === it.tab ? 'active' : ''}`}
            key={it.label}
            onClick={() => setTab(it.tab)}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
      <div className="teacher-nav-section-title">Другое</div>
      <nav className="teacher-nav">
        {other.map(it => (
          <button
            className={`teacher-nav-item ${activeTab === it.tab ? 'active' : ''}`}
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

export default TeacherSidebar;
