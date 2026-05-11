import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './StudentCourseDetails.css';
import { ISearchDetails } from '../../../models/ICourseDetail';
import Loader from '../../common/Loader';
import CourseMetaIcons from '../../common/CourseMetaIcons';

function countLessonsInCourse(course: ISearchDetails): number {
  if (course.lessons_count != null && course.lessons_count >= 0) {
    return Number(course.lessons_count);
  }
  const fromModules = (course.modules || []).reduce(
    (n, m) => n + (m.lessons?.length || 0),
    0
  );
  const standalone = (course.lessons || []).length;
  return fromModules + standalone;
}

const moduleOpenKey = (moduleId: number) => `m-${moduleId}`;
const STANDALONE_LESSONS_KEY = 'lessons-standalone';

const StudentCourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModuleKeys, setOpenModuleKeys] = useState<Set<string>>(() => new Set());

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

  useEffect(() => {
    if (!course) return;
    const keys = new Set<string>();
    (course.modules || []).forEach((m) => keys.add(moduleOpenKey(m.id)));
    if (course.lessons?.length) {
      keys.add(STANDALONE_LESSONS_KEY);
    }
    setOpenModuleKeys(keys);
    // Intentionally only when navigating to another course — keep user toggles on refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  const toggleModuleOpen = useCallback((key: string) => {
    setOpenModuleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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
          <div className="student-course-hero">
            <div className="student-course-cover-wrap">
              <img
                src={course.image_url || 'https://via.placeholder.com/400x240'}
                alt={course.title}
                className="student-course-cover"
              />
            </div>
            <div className="student-course-hero-text">
              <h1>{course.title}</h1>
              <p className="student-course-description">{course.description}</p>
              <div className="student-course-hero-meta">
                <CourseMetaIcons
                  variant="compact"
                  authorName={course.author_name}
                  lessonsCount={countLessonsInCourse(course)}
                  studentsCount={Number(course.students_count) || 0}
                />
              </div>
            </div>
          </div>
          <div className="student-course-curriculum">
            {hasModules ? (
              course.modules.map((module) => {
                const key = moduleOpenKey(module.id);
                const isOpen = openModuleKeys.has(key);
                return (
                  <div
                    className={`curriculum-module ${isOpen ? 'curriculum-module--open' : 'curriculum-module--closed'}`}
                    key={module.id}
                  >
                    <button
                      type="button"
                      className="curriculum-module-header"
                      onClick={() => toggleModuleOpen(key)}
                      aria-expanded={isOpen}
                    >
                      <Icon
                        icon="mdi:chevron-down"
                        className="curriculum-module-chevron"
                        aria-hidden
                      />
                      <span className="curriculum-module-heading">{module.title}</span>
                    </button>
                    {isOpen && (
                      <div className="curriculum-lessons">
                        {module.lessons.length > 0 ? (
                          module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="curriculum-lesson"
                              onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                            >
                              <div className="lesson-left">
                                <Icon
                                  icon={
                                    lesson.type === 'assignment'
                                      ? 'mdi:clipboard-text'
                                      : 'mdi:play-circle-outline'
                                  }
                                />
                                <span>{lesson.title}</span>
                              </div>
                              <div className="lesson-type-badge">
                                {lesson.type === 'assignment' ? 'Задание' : 'Лекция'}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="curriculum-empty">В этом модуле пока нет уроков</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : null}

            {hasStandaloneLessons && (
              <div
                className={`curriculum-module ${
                  openModuleKeys.has(STANDALONE_LESSONS_KEY)
                    ? 'curriculum-module--open'
                    : 'curriculum-module--closed'
                }`}
              >
                <button
                  type="button"
                  className="curriculum-module-header"
                  onClick={() => toggleModuleOpen(STANDALONE_LESSONS_KEY)}
                  aria-expanded={openModuleKeys.has(STANDALONE_LESSONS_KEY)}
                >
                  <Icon
                    icon="mdi:chevron-down"
                    className="curriculum-module-chevron"
                    aria-hidden
                  />
                  <span className="curriculum-module-heading">Уроки</span>
                </button>
                {openModuleKeys.has(STANDALONE_LESSONS_KEY) && (
                  <div className="curriculum-lessons">
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="curriculum-lesson"
                        onClick={() => navigate(`/student/lesson/${lesson.id}`)}
                      >
                        <div className="lesson-left">
                          <Icon
                            icon={
                              lesson.type === 'assignment'
                                ? 'mdi:clipboard-text'
                                : 'mdi:play-circle-outline'
                            }
                          />
                          <span>{lesson.title}</span>
                        </div>
                        <div className="lesson-type-badge">
                          {lesson.type === 'assignment' ? 'Задание' : 'Лекция'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
