import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './StudentMyCourses.css';

const StudentMyCourses: React.FC = () => {
  const { store } = useContext(Context);

  return (
    <div className="student-my-courses-page">
      <h1>Мои курсы</h1>
      <div className="my-courses-content">
        {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
          <div className="student-courses-grid">
            {(store.user as any).courses.map((course: any) => (
            <Link to={`/student/courses/${course.id}`} key={course.id} className="student-course-card-link">
              <div className="student-course-card">
                <img src={course.image_url || 'https://via.placeholder.com/300x160'} alt={course.title} className="student-course-card-img" />
                <div className="student-course-card-info">
                  <h3>{course.title}</h3>
                  <div className="student-course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '50%' }}></div>
                    </div>
                    <span className="progress-text">3/10 занятий</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        ) : (
          <div className="my-courses-empty">
            <Icon icon="mdi:folder-open-outline" className="empty-icon" />
            <h2>У вас пока нет курсов</h2>
            <p>Перейдите в раздел «Поиск», чтобы найти интересные вам курсы!</p>
            <Link to="/student/courses" className="go-to-search-btn">
              Перейти к поиску
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(StudentMyCourses);
