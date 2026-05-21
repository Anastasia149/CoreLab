import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { Icon } from '@iconify/react';
import '../dashboard/TeacherLayout.css';
import './CourseDetail.css';

import { ISearchDetails, Module, Lesson } from '../../../models/ICourseDetail';
import { ICourseStudent } from '../../../models/ICourseStudent';
import Loader from '../../common/Loader';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [courseStudents, setCourseStudents] = useState<ICourseStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [removingStudentId, setRemovingStudentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await store.getCourseDetails(Number(id));
        setCourse(response || null);
        if (response && response.modules && response.modules.length > 0) {
          setActiveModule(response.modules.map(module => module.id));
        }
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseDetails();
    }
  }, [id, store]);

  useEffect(() => {
    if (!id || activeTab !== 'settings') return;
    setStudentsLoading(true);
    store
      .getCourseStudents(Number(id))
      .then((list) => setCourseStudents(list))
      .finally(() => setStudentsLoading(false));
  }, [id, activeTab, store]);

  const handleRemoveStudent = async (student: ICourseStudent) => {
    const label = student.name?.trim() || student.email;
    if (
      !window.confirm(
        `Удалить ${label} с курса? Ученик потеряет доступ к материалам и работам этого курса.`
      )
    ) {
      return;
    }
    setRemovingStudentId(student.id);
    const ok = await store.removeStudentFromCourse(Number(id), student.id);
    setRemovingStudentId(null);
    if (ok) {
      setCourseStudents((prev) => prev.filter((s) => s.id !== student.id));
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              students_count: Math.max(0, (prev.students_count ?? 1) - 1),
            }
          : prev
      );
    } else {
      alert('Не удалось удалить ученика с курса. Попробуйте позже.');
    }
  };

  const toggleModule = (moduleId: number) => {
    setActiveModule(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const hasVisibleModules = course?.modules?.some((m: Module) => m.lessons.length > 0) ?? false;
  const hasOrphanLessons = (course?.lessons?.length ?? 0) > 0;
  const isCourseEmpty = !hasVisibleModules && !hasOrphanLessons;

  const [isOrphanLessonsOpen, setIsOrphanLessonsOpen] = useState(true);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот курс? Все уроки и материалы будут удалены безвозвратно.')) {
      if (id) {
        await store.deleteCourse(Number(id));
        navigate('/teacher/courses');
      }
    }
  };

  if (loading) {
    return (
      <div className="teacher-layout">
        <TeacherSidebar />
        <main className="teacher-content">
          <Loader size="inline" />
        </main>
      </div>
    );
  }

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={course?.title || 'Курс'} />
        <div className="teacher-courses-page course-detail-page">
          <h1>{course?.title}</h1>

          <div className="lesson-detail-tabs">
            <button 
              className={`tab-button ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Уроки
            </button>
            <button 
              className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Настройки
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'lessons' && (
              <>
                <div className="course-detail-header">
                  <div className="add-lesson-dropdown-container">
                    <button 
                      className={`teacher-add-btn ${isAddLessonOpen ? 'active' : ''}`} 
                      onClick={() => setIsAddLessonOpen(!isAddLessonOpen)}
                    >
                      <span>Добавить урок</span>
                      <Icon icon="mdi:chevron-down" />
                    </button>
                    
                    {isAddLessonOpen && (
                      <div className="add-lesson-dropdown">
                        <button onClick={() => navigate(`/teacher/course/${id}/create-lesson?type=lecture`)}>
                          <Icon icon="mdi:play-circle-outline" />
                          <span>Лекция</span>
                        </button>
                        <button onClick={() => navigate(`/teacher/course/${id}/create-lesson?type=assignment`)}>
                          <Icon icon="mdi:note-edit-outline" />
                          <span>Задание</span>
                        </button>
                        <button onClick={() => navigate(`/teacher/course/${id}/create-test`)}>
                          <Icon icon="mdi:help-circle-outline" />
                          <span>Тест</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isCourseEmpty ? (
                  <div className="teacher-courses-empty">
                    <h2>В вашем курсе ещё нет урока! Нажмите плюс, чтобы создать!</h2>
                  </div>
                ) : (
                  <>
                    {hasVisibleModules && (
                      <div className="course-modules-accordion">
                        {course?.modules?.filter((module: Module) => module.lessons.length > 0).map((module: Module) => (
                          <div key={module.id} className="module-item">
                            <button
                              className={`module-header ${activeModule?.includes(module.id) ? 'active' : ''}`}
                              onClick={() => toggleModule(module.id)}
                            >
                              <span>{module.title}</span>
                              <Icon icon={activeModule?.includes(module.id) ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                            </button>
                            {activeModule?.includes(module.id) && (
                              <div className="module-content">
                                {module.lessons.map((lesson: Lesson) => (
                                  <div key={lesson.id} className="lesson-item">
                                    <div className="lesson-item-main">
                                      {lesson.image_url && <img src={lesson.image_url} alt={lesson.title} className="lesson-item-image" />}
                                      <div className="lesson-title">{lesson.title}</div>
                                    </div>
                                    <button className="lesson-goto-btn" onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}>Перейти</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {hasOrphanLessons && (
                      <div className="lessons-without-module">
                        <button
                          className={`module-header ${isOrphanLessonsOpen ? 'active' : ''}`}
                          onClick={() => setIsOrphanLessonsOpen(!isOrphanLessonsOpen)}
                        >
                          <h3>Уроки без модуля</h3>
                          <Icon icon={isOrphanLessonsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
                        </button>
                        {isOrphanLessonsOpen && (
                          <div className="module-content">
                            {course?.lessons?.map((lesson: Lesson) => (
                              <div key={lesson.id} className="lesson-item">
                                <div className="lesson-item-main">
                                  {lesson.image_url && <img src={lesson.image_url} alt={lesson.title} className="lesson-item-image" />}
                                  <div className="lesson-title">{lesson.title}</div>
                                </div>
                                <button className="lesson-goto-btn" onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}>Перейти</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === 'settings' && (
              <div className="course-settings-tab">
                <div className="settings-section">
                  <h4>Управление курсом</h4>
                  <button className="lesson-action-btn edit" onClick={() => navigate(`/teacher/course/${id}/edit`)}>Редактировать курс</button>
                  <button className="lesson-action-btn delete" onClick={handleDelete}>Удалить курс</button>
                </div>
                <div className="settings-section">
                  <h4>Управление учениками</h4>
                  {studentsLoading ? (
                    <p className="course-students-status">Загрузка...</p>
                  ) : courseStudents.length === 0 ? (
                    <p className="course-students-status">На курс пока никто не записался.</p>
                  ) : (
                    <ul className="course-students-list">
                      {courseStudents.map((student) => {
                        const displayName =
                          student.name?.trim() || student.email || 'Ученик';
                        return (
                          <li key={student.id} className="course-student-item">
                            <div className="course-student-main">
                              <div className="course-student-avatar">
                                {student.avatar ? (
                                  <img src={student.avatar} alt="" />
                                ) : (
                                  <Icon icon="solar:user-circle-linear" aria-hidden />
                                )}
                              </div>
                              <div className="course-student-text">
                                <span className="course-student-name">{displayName}</span>
                                {student.name?.trim() && (
                                  <span className="course-student-email">{student.email}</span>
                                )}
                              </div>
                            </div>
                            <div className="course-student-actions">
                              <button
                                type="button"
                                className="course-student-btn course-student-btn--view"
                                onClick={() =>
                                  navigate(`/teacher/course/${id}/student/${student.id}`)
                                }
                              >
                                Профиль
                              </button>
                              <button
                                type="button"
                                className="course-student-btn course-student-btn--remove"
                                disabled={removingStudentId === student.id}
                                onClick={() => handleRemoveStudent(student)}
                              >
                                {removingStudentId === student.id ? 'Удаление...' : 'Удалить'}
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default observer(CourseDetail);
