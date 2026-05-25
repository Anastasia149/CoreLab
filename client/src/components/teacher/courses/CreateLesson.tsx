import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { useFormFields } from '../../../hooks/useFormFields';
import { Module } from '../../../models/ICourseDetail';
import $api from '../../../http';
import '../dashboard/TeacherLayout.css';
import './CreateLesson.css';
import { LessonDeadlineField } from './LessonDeadlineField';
import {
  deadlineLocalToIso,
  lessonTypeHasDeadline,
  validateDeadlineLocal,
} from '../../../utils/lessonDeadline';
import { useAppModal } from '../../../context/AppModalContext';
import {
  ASSIGNMENT_FILE_MAX_BYTES,
  formatFileSize,
  getAssignmentFileSizeError,
} from '../../../constants/fileLimits';

const CreateLesson: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'lecture';
  
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const { showModal } = useAppModal();
  const { fields, handleChange, setFieldValue } = useFormFields({
    title: '',
    content: '',
    moduleId: '',
    type: initialType,
    file: null as File | null,
    image: null as File | null,
    deadline: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [modules, setModules] = useState<Module[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      if (courseId) {
        const courseDetails = await store.getCourseDetails(Number(courseId));
        if (courseDetails && courseDetails.modules) {
          setModules(courseDetails.modules);
        }
      }
    };
    fetchModules();
  }, [courseId, store]);

  const handleCreateModule = async () => {
    if (newModuleName.trim() !== '' && courseId) {
      if (newModuleName.charAt(0) !== newModuleName.charAt(0).toUpperCase()) {
        void showModal('Название модуля должно начинаться с большой буквы.');
        return;
      }
      const newModule = await store.createModule(courseId, newModuleName);
      if (newModule) {
        setModules([...modules, newModule]);
        setFieldValue('moduleId', newModule.id.toString());
        setIsModalOpen(false);
        setNewModuleName('');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mainType = file.type.split('/')[0];

      if (mainType !== 'image') {
        void showModal('Пожалуйста, выберите файл изображения.');
        e.target.value = '';
        setFieldValue('image', null);
        setImagePreview(null);
        return;
      }

      setFieldValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFieldValue('image', null);
      setImagePreview(null);
    }
  };

  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type;
      const mainType = fileType.split('/')[0];
      const allowedMainTypes = ['image', 'video'];
      const allowedFullTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (!allowedMainTypes.includes(mainType) && !allowedFullTypes.includes(fileType)) {
        void showModal('Недопустимый тип файла. Разрешены только изображения, видео и документы (pdf, doc, xls, ppt).');
        e.target.value = '';
        setFieldValue('file', null);
        setFilePreview(null);
        return;
      }

      const sizeError = getAssignmentFileSizeError(file);
      if (sizeError) {
        void showModal(sizeError);
        e.target.value = '';
        setFieldValue('file', null);
        setFilePreview(null);
        return;
      }

      setFieldValue('file', file);
      setFilePreview(file.name);
    } else {
      setFieldValue('file', null);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (fields.title.charAt(0) !== fields.title.charAt(0).toUpperCase()) {
      await showModal('Название урока должно начинаться с большой буквы.');
      return;
    }
    if (fields.content && fields.content.charAt(0) !== fields.content.charAt(0).toUpperCase()) {
      await showModal('Описание урока должно начинаться с большой буквы.');
      return;
    }

    let imageUrl: string | null = null;
    if (fields.image) {
      const formData = new FormData();
      formData.append('file', fields.image);
      const response = await $api.post<{ url: string }>('/upload', formData);
      imageUrl = response.data.url;
    }

    if (lessonTypeHasDeadline(fields.type)) {
      const deadlineError = validateDeadlineLocal(fields.deadline);
      if (deadlineError) {
        await showModal(deadlineError);
        return;
      }
    }

    const moduleId = fields.moduleId === '' ? null : fields.moduleId;
    const deadline = lessonTypeHasDeadline(fields.type)
      ? deadlineLocalToIso(fields.deadline)
      : null;

    const newLesson = await store.createLesson(
      courseId,
      moduleId,
      fields.title,
      fields.content,
      imageUrl,
      fields.type,
      deadline
    );

    if (newLesson && fields.file) {
      const sizeError = getAssignmentFileSizeError(fields.file);
      if (sizeError) {
        await showModal(sizeError);
        return;
      }
      await store.uploadLessonMaterial(newLesson.id, fields.file);
    }

    navigate(`/teacher/course/${courseId}`);
  };

  const typeNames: { [key: string]: string } = {
    lecture: 'лекции',
    assignment: 'задания',
    test: 'теста'
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={`Создание ${typeNames[fields.type] || 'урока'}`} />
        <div className="teacher-courses-page">
          <form className="create-course-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Название урока</label>
              <input
                type="text"
                id="title"
                value={fields.title}
                onChange={handleChange('title')}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="content">Описание</label>
              <textarea
                id="content"
                value={fields.content}
                onChange={handleChange('content')}
              />
            </div>
            {lessonTypeHasDeadline(fields.type) && (
              <LessonDeadlineField
                value={fields.deadline}
                onChange={(value) => setFieldValue('deadline', value)}
              />
            )}
            <div className="form-group">
                <label htmlFor="module">Модуль</label>
                <div className="module-select-wrapper">
                    <select id="module" value={fields.moduleId} onChange={handleChange('moduleId')}>
                        <option value="">Без модуля</option>
                        {modules.map(module => (
                            <option key={module.id} value={module.id}>{module.title}</option>
                        ))}
                    </select>
                    <button type="button" className="add-module-btn" onClick={() => setIsModalOpen(true)}>Создать модуль</button>
                </div>
            </div>
            <div className="form-group full-width">
              <label>Материалы урока</label>
              <div className="file-upload-wrapper">
                <label htmlFor="file" className="file-upload-button">
                  Выберите файл
                </label>
                <input
                  type="file"
                  id="file"
                  className="file-upload-input"
                  onChange={handleFileChange}
                  accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                />
                <span className="file-upload-name">
                  {fields.file ? fields.file.name : 'Файл не выбран'}
                </span>
                <p className="file-size-hint">
                  Максимальный размер файла — {formatFileSize(ASSIGNMENT_FILE_MAX_BYTES)}
                </p>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Обложка урока</label>
              <div className="file-upload-wrapper">
                <label htmlFor="image" className="file-upload-button">
                  Выберите изображение
                </label>
                <input
                  type="file"
                  id="image"
                  className="file-upload-input"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <span className="file-upload-name">
                  {fields.image ? fields.image.name : 'Файл не выбран'}
                </span>
                {imagePreview && <img src={imagePreview} alt="Превью" className="file-upload-preview" />}
              </div>
            </div>
            <button type="submit" className="auth-submit-button full-width">Создать урок</button>
          </form>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Создать новый модуль</h2>
                <div className="form-group">
                  <label htmlFor="newModuleName">Название модуля</label>
                  <input
                    type="text"
                    id="newModuleName"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button onClick={handleCreateModule} className="auth-submit-button">Создать</button>
                  <button onClick={() => setIsModalOpen(false)} className="cancel-btn">Отмена</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default observer(CreateLesson);

