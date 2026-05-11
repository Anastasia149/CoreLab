import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import '../../teacher/courses/TeacherCourses.css';
import './StudentMyCourses.css';

const StudentMyCourses: React.FC = () => {
  const { store } = useContext(Context);

  return (
    <div className="student-my-courses-page">
      <h1>Мои курсы</h1>
      <div className="my-courses-content">
        {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
          <div className="student-courses-grid">
            {(store.user as any).courses.map((course: any) => {
              const totalLessons = course.lessons_count || 0;
              const completedLessons = course.completed_lessons || 0;
              const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

              return (
                <Link
                  to={`/student/courses/${course.id}`}
                  key={course.id}
                  className="student-course-card-link"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="course-card">
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
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="my-courses-empty">
            <Icon icon="mdi:folder-open-outline" className="empty-icon" />
            <h2>У вас пока нет курсов</h2>
            <p>Перейдите в раздел «Поиск», чтобы найти интересные вам курсы!</p>
            <Link to="/student/search" className="go-to-search-btn">
              Перейти к поиску
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(StudentMyCourses);
