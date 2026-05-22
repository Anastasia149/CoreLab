import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import '../dashboard/TeacherLayout.css';
import './TeacherCourses.css';
import { Icon } from '@iconify/react';

import { useNavigate } from 'react-router-dom';
import { formatCoursePriceDisplay } from '../../../utils/coursePrice';
import { getCourseCoverUrl } from '../../../constants/courseCover';

const TeacherCourses: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    store.getTeacherCourses();
  }, [store]);

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader />
        <div className="teacher-courses-page">
          <div className="teacher-courses-header">
            <button className="teacher-add-btn" onClick={() => navigate('/teacher/create-course')}>
              Добавить курс
            </button>
          </div>
          {store.isLoading ? (
            <p>Загрузка...</p>
          ) : store.courses.length > 0 ? (
            <div className="teacher-courses-grid">
              {store.courses.map((course: ICourse) => (
                <div className="course-card" key={course.id} onClick={() => navigate(`/teacher/course/${course.id}`)}>
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
            <div className="teacher-courses-empty">
              <h2>У вас пока нет курсов! Нажмите плюс, чтобы создать!</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default observer(TeacherCourses);
