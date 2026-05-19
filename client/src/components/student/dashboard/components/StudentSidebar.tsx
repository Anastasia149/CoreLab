import React from 'react';
import { Icon } from '@iconify/react';
import './StudentSidebar.css';
import { NavLink } from 'react-router-dom';

const primary = [
  { icon: 'hugeicons:menu-square', label: 'Главная', path: '/student' },
  { icon: 'mdi:calendar-outline', label: 'Расписание', path: '/student/schedule' },
  { icon: 'mdi:forum-outline', label: 'Форум', path: '/student/forum' },
  { icon: 'mdi:credit-card-outline', label: 'Оплата', path: '/student/billing' },
];

const courses = [
  { icon: 'mdi:folder-outline', label: 'Мои курсы', path: '/student/my-courses' },
  { icon: 'hugeicons:internet', label: 'Поиск', path: '/student/search' },
];

const other = [
  { icon: 'mdi:help-circle-outline', label: 'Поддержка', path: '/student/support' },
  { icon: 'mdi:cog-outline', label: 'Настройки', path: '/student/settings' },
];

const StudentSidebar: React.FC = () => {
  return (
    <aside className="student-sidebar">
      <NavLink to="/" className="student-brand">
        <Icon icon="icomoon-free:book" className="student-brand-icon" />
        <div className="student-brand-text">CoreLab</div>
      </NavLink>
      <div className="student-nav-section-title">Основное</div>
      <nav className="student-nav">
        {primary.map((it) => (
          <NavLink
            to={it.path}
            className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}
            key={it.label}
            end={it.path === '/student'}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="student-nav-section-title">Курсы</div>
      <nav className="student-nav">
        {courses.map(it => (
          <NavLink
            to={it.path}
            className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}
            key={it.label}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="student-nav-section-title">Другое</div>
      <nav className="student-nav">
        {other.map(it => (
          <NavLink
            to={it.path}
            className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}
            key={it.label}
          >
            <Icon icon={it.icon} />
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default StudentSidebar;
