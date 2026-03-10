import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { Icon } from '@iconify/react';
import '../dashboard/teacher.css';
import './courses.css';

import { CourseDetails } from '../../../models/ICourseDetail';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { store } = useContext(Context);
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState('lessons');

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

  const toggleModule = (moduleId: number) => {
    setActiveModule(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const hasVisibleModules = course?.modules?.some(m => m.lessons.length > 0) ?? false;
  const hasOrphanLessons = (course?.lessons?.length ?? 0) > 0;
  const isCourseEmpty = !hasVisibleModules && !hasOrphanLessons;

  if (loading) {
    return <div>Загрузка...</div>; 
  }

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={course?.title || 'Курс'} tab="courses" />
        <div className="teacher-courses-page">
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
                  <button className="teacher-add-btn" onClick={() => navigate(`/teacher/course/${id}/create-lesson`)}>
                    Добавить урок
                  </button>
                </div>

                {isCourseEmpty ? (
                  <div className="teacher-courses-empty">
                    <h2>В вашем курсе ещё нет урока! Нажмите плюс, чтобы создать!</h2>
                  </div>
                ) : (
                  <>
                    {hasVisibleModules && (
                      <div className="course-modules-accordion">
                        {course?.modules?.filter(module => module.lessons.length > 0).map((module) => (
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
                                {module.lessons.map((lesson) => (
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
                        <h3>Уроки без модуля</h3>
                        <div className="module-content">
                          {course?.lessons?.map((lesson) => (
                            <div key={lesson.id} className="lesson-item">
                              <div className="lesson-item-main">
                                {lesson.image_url && <img src={lesson.image_url} alt={lesson.title} className="lesson-item-image" />}
                                <div className="lesson-title">{lesson.title}</div>
                              </div>
                              <button className="lesson-goto-btn" onClick={() => navigate(`/teacher/lesson/${lesson.id}`)}>Перейти</button>
                            </div>
                          ))}
                        </div>
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
                  <button className="lesson-action-btn delete">Удалить курс</button>
                </div>
                <div className="settings-section">
                  <h4>Управление учениками</h4>
                  <button className="add-student-btn">Добавить ученика</button>
                  <p>Здесь будет список учеников.</p>
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
