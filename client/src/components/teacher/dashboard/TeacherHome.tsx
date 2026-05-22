import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Context } from '../../../index';
import TeacherHeader from './components/TeacherHeader';
import TeacherSidebar from './components/TeacherSidebar';
import TeacherCalendar from './components/TeacherCalendar';
import TeacherSchedule from './components/TeacherSchedule';
import { observer } from 'mobx-react-lite';
import { ICourse } from '../../../models/ICourse';
import ScheduleHome from '../schedule/ScheduleHome';
import '../courses/TeacherCourses.css';
import './TeacherHome.css';
import './TeacherLayout.css';
import illustration from '../../home/pictures/Online learning-bro.svg';
import { formatCoursePriceDisplay } from '../../../utils/coursePrice';
import { getCourseCoverUrl } from '../../../constants/courseCover';
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
                        <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="course-card-image" />
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
          </div>
        )}
      </main>
    </div>
  );
};

export default observer(TeacherHome);
