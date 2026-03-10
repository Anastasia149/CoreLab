import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Lesson } from '../../../models/ICourseDetail';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import '../dashboard/teacher.css';
import '../courses/courses.css';

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then(data => setLesson(data || null));
    }
  }, [lessonId, store]);

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
        <TeacherHeader name={store.user?.name} tab={'courses'} />
        <div className="teacher-courses-page">
          {!lesson ? (
            <div>Загрузка...</div>
          ) : (
            <>
              <h1>{lesson.title}</h1>
              
              <div className="lesson-detail-tabs">
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
                    <p>Здесь будут отображаться работы учеников.</p>
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
