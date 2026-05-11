import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ISearchDetails, Lesson, Material } from '../../../models/ICourseDetail';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { Icon } from '@iconify/react';
import '../dashboard/TeacherLayout.css';
import '../courses/CreateLesson.css';

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then(data => {
        setLesson(data || null);
        if (data && data.type === 'test' && activeTab === 'materials') {
          setActiveTab('students');
        }
      });
    }

    if (lessonId && activeTab === 'students') {
      store.getLessonSubmissions(lessonId).then(subs => setSubmissions(Array.isArray(subs) ? subs : []));
    }
  }, [lessonId, store, activeTab]);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      if (lessonId) {
        await store.deleteLesson(lessonId);
        navigate(`/teacher/course/${lesson?.course_id}`);
      }
    }
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={lesson?.title || 'Урок'} />
        <div className="teacher-courses-page">
          {!lesson ? (
            <div>Загрузка...</div>
          ) : (
            <>
              <h1>{lesson.title}</h1>
              
              <div className="lesson-detail-tabs">
                {lesson.type !== 'test' && (
                  <button 
                    className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                  >
                    Материалы
                  </button>
                )}
                <button 
                  className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  Работы учеников
                </button>
                <button 
                  className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Настройки урока
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'students' && (
                  <div className="students-tab">
                    {lesson.type === 'lecture' ? (
                      <p className="info-text">Для лекций не предусмотрена сдача работ.</p>
                    ) : (
                      <div className="submissions-list">
                        {submissions.length === 0 ? (
                          <p>Работ пока нет.</p>
                        ) : (
                          submissions.map(s => (
                            <div key={s.id} className="submission-item">
                              <div className="submission-user">
                                <Icon icon="solar:user-circle-linear" />
                                <span>{s.student_name}</span>
                              </div>
                              <div className="submission-type">
                                {s.type === 'completed' && <span>Отмечено как выполнено</span>}
                                {s.type === 'link' && <a href={s.content} target="_blank" rel="noopener noreferrer">Открыть ссылку</a>}
                                {s.type === 'file' && <a href={s.content} target="_blank" rel="noopener noreferrer">Открыть файл</a>}
                              </div>
                              <div className="submission-date">
                                {new Date(s.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'materials' && lesson.type !== 'test' && (
                  <div className="materials-tab">
                    {lesson.materials.length === 0 ? (
                      <p>Материалов пока нет.</p>
                    ) : (
                      <div className="materials-grid">
                        {lesson.materials.map(m => (
                          <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="material-card">
                            <Icon icon="mdi:file-document-outline" />
                            <span>{m.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="lesson-settings-tab">
                    <button className="lesson-action-btn edit" onClick={() => navigate(`/teacher/lesson/${lessonId}/edit`)}>Редактировать урок</button>
                    <button className="lesson-action-btn delete" onClick={handleDelete}>Удалить урок</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default observer(LessonDetail);
