import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import TeacherHeader from './components/TeacherHeader';
import TeacherSidebar from './components/TeacherSidebar';
import TeacherCalendar from './components/TeacherCalendar';
import TeacherSchedule from './components/TeacherSchedule';
import { observer } from 'mobx-react-lite';
import { ICourse } from '../../../models/ICourse';
import ScheduleHome from '../schedule/ScheduleHome';
import '../courses/TeacherCourses.css';
import './TeacherHome.css';
import illustration from '../../home/pictures/Online learning-bro.svg';
import { formatCoursePriceDisplay } from '../../../utils/coursePrice';
import { ThemeSettingsSection } from '../../common/ThemeSettingsSection';
import '../../common/SettingsPage.css';

const TeacherHome: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    store.getTeacherCourses();
  }, []);
  const logout = () => {
    store.logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader />
        {tab === 'schedule' ? (
          <ScheduleHome />
        ) : tab === 'settings' ? (
          <section className="teacher-settings-panel">
            <div className="teacher-section-title">Настройки</div>

            <div className="settings-card">
              <ThemeSettingsSection />
            </div>

            <div className="settings-card">
              <h4 className="settings-block-title">Аккаунт</h4>
              <p className="settings-block-desc">Выход из текущего профиля на этом устройстве.</p>
              <button type="button" className="settings-logout-btn" onClick={logout}>
                Выйти из аккаунта
              </button>
            </div>
          </section>
        ) : (
          <div className="teacher-grid">
            <section className="teacher-hero-card">
              <div className="teacher-hero-text">
                <div className="teacher-hero-title">Обучайте и вдохновляйте</div>
                <div className="teacher-hero-sub">Новые возможности для преподавания</div>
              </div>
              <div className="teacher-hero-art">
                <img src={illustration} alt="Illustration" className="teacher-hero-illustration" />
              </div>
            </section>

            <section className="teacher-calendar">
              <TeacherCalendar />
            </section>

            <div className="teacher-courses-group">
              <div className="teacher-section-title">
                Мои курсы
                {store.courses.length > 2 && (
                  <button className="teacher-show-all" onClick={() => navigate('/teacher/courses')}>
                    Показать все
                  </button>
                )}
              </div>
              <div className="teacher-courses">
                {store.courses.length > 0 ? (
                  <div className="teacher-courses-grid-home">
                    {store.courses.slice(0, 2).map((course: ICourse) => (
                      <div className="course-card" key={course.id} onClick={() => navigate('/teacher/courses')}>
                        <img src={course.image_url || 'https://via.placeholder.com/300x180'} alt={course.title} className="course-card-image" />
                        <div className="course-card-body">
                          <div className="course-card-title">{course.title}</div>
                          <div className="course-card-description">{course.description}</div>
                          <div className="course-card-details">
                            <div className={`course-card-status ${course.status}`}>{course.status === 'draft' ? 'Черновик' : 'Опубликован'}</div>
                            <div className="course-card-price">{formatCoursePriceDisplay(course.price)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="teacher-empty">
                    У вас пока нет курсов! Вы можете создать их в разделе «Мои курсы»!
                  </div>
                )}
              </div>
            </div>

            <section className="teacher-schedule-box">
              <TeacherSchedule />
            </section>

            <div className="teacher-tasks-group">
              <div className="teacher-section-title">Задачи на сегодня</div>
              <div className="teacher-tasks">
                <div className="teacher-tasks-list">
                  <label className="teacher-task">
                    <div className="teacher-task-content">
                      <span className="teacher-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Проверить домашнее задание по JSX
                    </div>
                    <input type="checkbox" />
                  </label>
                  <label className="teacher-task">
                    <div className="teacher-task-content">
                      <span className="teacher-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Подготовить материал к лекции по массивам
                    </div>
                    <input type="checkbox" />
                  </label>
                  <label className="teacher-task">
                    <div className="teacher-task-content">
                      <span className="teacher-task-icon-wrapper">
                        <Icon icon="system-uicons:book-text" />
                      </span>
                      Ответить на вопросы студентов
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

export default observer(TeacherHome);
