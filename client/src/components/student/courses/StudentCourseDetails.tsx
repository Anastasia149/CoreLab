import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './StudentCourseDetails.css';
import { ISearchDetails } from '../../../models/ICourseDetail';
import Loader from '../../common/Loader';
const StudentCourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/student/my-courses', { replace: true });
      return;
    }

    const courseId = Number(id);
    store.getCourseDetails(courseId).then(data => {
      if (data) {
        setCourse(data);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    }).finally(() => {
      setLoading(false);
    });
  }, [id, navigate, store]);

  if (loading) {
    return <Loader size="full-page" />;
  }

  if (!course) {
    return <div className="student-course-details-empty">Курс не найден</div>;
  }

  const hasModules = course.modules?.length > 0;
  const hasStandaloneLessons = course.lessons?.length > 0;

  return (
    <div className="student-course-details-page">
      <div className="student-course-details-main">
        <div className="student-course-panel">
          <h1>{course.title}</h1>
          <p className="student-course-description">{course.description}</p>
          <div className="student-course-curriculum">
            <h3>Учебная программа</h3>
            {hasModules ? (
              course.modules.map(module => (
                <div className="curriculum-module" key={module.id}>
                  <h4>{module.title}</h4>
                  <div className="curriculum-lessons">
                    {module.lessons.length > 0 ? module.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="curriculum-lesson"
                        onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                      >
                        <div className="lesson-left">
                          <Icon icon={lesson.type === 'assignment' ? 'mdi:clipboard-text' : 'mdi:play-circle-outline'} />
                          <span>{lesson.title}</span>
                        </div>
                        <div className="lesson-type-badge">
                          {lesson.type === 'assignment' ? 'Задание' : 'Лекция'}
                        </div>
                      </div>
                    )) : (
                      <div className="curriculum-empty">В этом модуле пока нет уроков</div>
                    )}
                  </div>
                </div>
              ))
            ) : null}

            {hasStandaloneLessons && (
              <div className="curriculum-module">
                <h4>Уроки</h4>
                <div className="curriculum-lessons">
                  {course.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="curriculum-lesson"
                      onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                    >
                      <div className="lesson-left">
                        <Icon icon={lesson.type === 'assignment' ? 'mdi:clipboard-text' : 'mdi:play-circle-outline'} />
                        <span>{lesson.title}</span>
                      </div>
                      <div className="lesson-type-badge">
                        {lesson.type === 'assignment' ? 'Задание' : 'Лекция'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasModules && !hasStandaloneLessons && (
              <div className="course-details-empty">В этом курсе пока нет уроков или модулей</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(StudentCourseDetails);
