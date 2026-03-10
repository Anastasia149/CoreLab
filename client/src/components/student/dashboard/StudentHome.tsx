import React, { useContext } from 'react';
import StudentHeader from './components/StudentHeader';
import StudentSidebar from './components/StudentSidebar';
import './student.css';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentCalendar from './components/StudentCalendar';
import StudentSchedule from './components/StudentSchedule';
import ScheduleHome from '../schedule/ScheduleHome';

const StudentHome: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const tab = searchParams.get('tab') || 'dashboard';
  const logout = () => {
    store.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="student-layout">
      <StudentSidebar />
      <main className="student-content">
        <StudentHeader name={store.user?.name} tab={tab} />
        {tab === 'schedule' ? (
          <ScheduleHome />
        ) : tab === 'settings' ? (
          <section className="student-calendar">
            <div className="student-section-title">Настройки</div>
            <button className="student-logout-btn" onClick={logout}>Выйти из аккаунта</button>
          </section>
        ) : (
          <div className="student-grid">
            <section className="student-hero-card">
              <div className="student-hero-text">
                <div className="student-hero-title">Учитесь и растите</div>
                <div className="student-hero-sub">Новые занятия уже ждут</div>
              </div>
              <div className="student-hero-art">
                <Icon icon="mdi:school-outline" />
              </div>
            </section>

            <section className="student-calendar">
              <StudentCalendar />
            </section>

            <div className="student-courses-group">
              <div className="student-section-title">Мои курсы</div>
              <div className="student-courses">
                {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
                  <div className="student-cards">
                    <div className="student-card">
                      <div className="student-card-title">Frontend базовый</div>
                      <div className="student-card-sub">3/10 занятий</div>
                    </div>
                    <div className="student-card">
                      <div className="student-card-title">Python основы</div>
                      <div className="student-card-sub">2/8 занятий</div>
                    </div>
                  </div>
                ) : (
                  <div className="student-empty">
                    У вас пока нет курсов! Вы можете найти их в разделе «поиск»!
                  </div>
                )}
              </div>
            </div>

            <section className="student-schedule-box">
              <StudentSchedule />
            </section>

            <div className="student-tasks-group">
              <div className="student-section-title">Задачи на сегодня</div>
              <div className="student-tasks">
                <div className="student-tasks-list">
                  <label className="student-task">
                    <div className="student-task-content">
                      <span className="student-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Пройти модуль по JSX
                    </div>
                    <input type="checkbox" />
                  </label>
                  <label className="student-task">
                    <div className="student-task-content">
                      <span className="student-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Сделать практику по массивам
                    </div>
                    <input type="checkbox" />
                  </label>
                  <label className="student-task">
                    <div className="student-task-content">
                      <span className="student-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Прочитать статью по Git
                    </div>
                    <input type="checkbox" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentHome;
