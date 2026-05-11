import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Lesson } from '../../../models/ICourseDetail';
import { Icon } from '@iconify/react';
import $api from '../../../http';
import './StudentLessonDetail.css';
import CourseMetaIcons from '../../common/CourseMetaIcons';

const StudentLessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [submitType, setSubmitType] = useState<'link' | 'file' | 'completed'>('completed');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then(data => setLesson(data || null));
      store.getMySubmission(lessonId).then(data => setSubmission(data || null));
    }
  }, [lessonId, store]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      let content = '';
      if (submitType === 'link') {
        content = link;
      } else if (submitType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await $api.post<{ url: string }>('/upload', formData);
        content = response.data.url;
      }

      const newSubmission = await store.submitAssignment(Number(lessonId), submitType, content);
      setSubmission(newSubmission);
      alert('Задание успешно отправлено!');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Ошибка при отправке задания.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lesson) {
    return <div className="student-lesson-loading">Загрузка урока...</div>;
  }

  return (
    <div className="student-lesson-container">
     

      <div className="lesson-header">
        <div className="lesson-badge">{lesson.type === 'lecture' ? 'Лекция' : 'Задание'}</div>
        <h1>{lesson.title}</h1>
        <div className="lesson-header-meta">
          <CourseMetaIcons
            variant="compact"
            omitLessons
            authorName={lesson.author_name}
            lessonsCount={0}
            studentsCount={Number(lesson.students_count) || 0}
          />
        </div>
      </div>

      <div className="lesson-content-grid">
        <div className="lesson-main-content">
          {lesson.image_url && <img src={lesson.image_url} alt={lesson.title} className="lesson-main-image" />}
          <div className="lesson-text" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          
          {lesson.materials.length > 0 && (
            <div className="lesson-materials-section">
              <h3>Материалы к уроку</h3>
              <div className="materials-grid">
                {lesson.materials.map(m => (
                  <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="material-card">
                    <Icon icon="mdi:file-document-outline" />
                    <span>{m.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lesson-sidebar">
          {lesson.type === 'assignment' && (
            <div className="submission-card">
              <h3>Ваше решение</h3>
              
              {submission ? (
                <div className="submission-status success">
                  <Icon icon="mdi:check-circle" />
                  <div>
                    <p className="status-title">Задание выполнено</p>
                    <p className="status-date">{new Date(submission.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="submission-form">
                  <div className="submit-type-selector">
                    <button 
                      type="button" 
                      className={submitType === 'completed' ? 'active' : ''} 
                      onClick={() => setSubmitType('completed')}
                    >
                      Отметить
                    </button>
                    <button 
                      type="button" 
                      className={submitType === 'link' ? 'active' : ''} 
                      onClick={() => setSubmitType('link')}
                    >
                      Ссылка
                    </button>
                    <button 
                      type="button" 
                      className={submitType === 'file' ? 'active' : ''} 
                      onClick={() => setSubmitType('file')}
                    >
                      Файл
                    </button>
                  </div>

                  {submitType === 'link' && (
                    <input 
                      type="url" 
                      placeholder="Вставьте ссылку на работу" 
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      className="submit-input"
                    />
                  )}

                  {submitType === 'file' && (
                    <div className="file-input-wrapper">
                      <input 
                        type="file" 
                        id="assign-file" 
                        onChange={handleFileChange}
                        required
                        className="hidden-file-input"
                      />
                      <label htmlFor="assign-file" className="file-label">
                        <Icon icon="mdi:cloud-upload-outline" />
                        {file ? file.name : 'Выберите файл'}
                      </label>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Отправка...' : 'Сдать работу'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default observer(StudentLessonDetail);
