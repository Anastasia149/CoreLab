import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../teacher/courses/TeacherCourses.css';
import '../../student/courses/StudentMyCourses.css';
import './StudentHome.css';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import StudentCalendar from './components/StudentCalendar';
import StudentSchedule from './components/StudentSchedule';
import illustration from '../../home/pictures/Online learning-bro.svg';

const StudentHome: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  return (
    <div className="student-grid">
      <section className="student-hero-card">
        <div className="student-hero-text">
          <div className="student-hero-title">Учитесь и растите</div>
          <div className="student-hero-sub">Новые занятия уже ждут</div>
        </div>
        <div className="student-hero-art">
          <img src={illustration} alt="Illustration" className="student-hero-illustration" />
        </div>
      </section>

      <section className="student-calendar">
        <StudentCalendar />
      </section>

      <div className="student-courses-group">
        <div className="student-section-title">
          Мои курсы
          {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 2 && (
            <button className="teacher-show-all" onClick={() => navigate('/student/my-courses')}>
              Показать все
            </button>
          )}
        </div>
        <div className="student-courses">
          {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
            <div className="teacher-courses-grid-home">
              {(store.user as any).courses.slice(0, 2).map((course: any) => {
                const totalLessons = course.lessons_count || 0;
                const completedLessons = course.completed_lessons || 0;
                const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

                return (
                  <div className="course-card" key={course.id}>
                    <img src={course.image_url || 'https://via.placeholder.com/300x180'} alt={course.title} className="course-card-image" />
                    <div className="course-card-body">
                      <div className="course-card-title">{course.title}</div>
                      <div className="course-card-description">{course.description}</div>
                      <div className="student-course-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="progress-text">{`${completedLessons}/${totalLessons} занятий`}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="teacher-empty">
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
  );
};

export default StudentHome;
