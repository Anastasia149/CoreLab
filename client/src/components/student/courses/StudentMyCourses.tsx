import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import '../../teacher/courses/TeacherCourses.css';
import './StudentMyCourses.css';
import CourseMetaIcons from '../../common/CourseMetaIcons';
import { getCourseProgressTotals } from '../../../utils/courseProgress';
import { getCourseCoverUrl } from '../../../constants/courseCover';

const StudentMyCourses: React.FC = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    store.refreshMyCourses();
  }, [store]);

  return (
    <div className="student-my-courses-page">
      <div className="my-courses-content">
        {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
          <div className="student-courses-grid">
            {(store.user as any).courses.map((course: any) => {
              const { completed, total, percent } = getCourseProgressTotals(course);

              return (
                <Link
                  to={`/student/my-courses/${course.id}`}
                  key={course.id}
                  className="student-course-card-link"
                >
                  <div className="course-card">
                    <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="course-card-image" />
                    <div className="course-card-body">
                      <div className="course-card-title">{course.title}</div>
                      <div className="course-card-description">{course.description}</div>
                      <div className="my-courses-card-meta">
                        <CourseMetaIcons
                          variant="compact"
                          authorName={course.author_name}
                          lessonsCount={Number(course.lessons_count) || 0}
                          studentsCount={Number(course.students_count) || 0}
                        />
                      </div>
                      <div className="student-course-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="progress-text">
                          {total > 0
                            ? `${percent}% пройдено`
                            : '0% пройдено'}
                        </span>
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
