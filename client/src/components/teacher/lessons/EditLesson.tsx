import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { useFormFields } from '../../../hooks/useFormFields';
import { Module, Material } from '../../../models/ICourseDetail';
import $api from '../../../http';
import { Icon } from '@iconify/react';
import '../dashboard/TeacherLayout.css';
import '../courses/CreateLesson.css';

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  isRequired: boolean;
}

const EditLesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const { fields, handleChange, setFieldValue, setFields } = useFormFields({
    title: '',
    content: '',
    moduleId: '',
    type: 'lecture',
    image: null as File | null,
    file: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [courseId, setCourseId] = useState<string | null>(null);

  // Test specific states
  const [testQuestions, setTestQuestions] = useState<Question[]>(
    [
      {
        id: Date.now().toString(),
        text: '',
        type: 'single',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ],
        isRequired: true
      }
    ]
  );

  const [testTitle, setTestTitle] = useState('');

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then(data => {
        if (data) {
          setFields({
            title: data.title,
            content: data.content,
            moduleId: data.module_id?.toString() || '',
            type: data.type || 'lecture',
            image: null,
            file: null,
          });
          setImagePreview(data.image_url || null);
          setMaterials(data.materials || []);
          setCourseId(data.course_id.toString());

          if (data.type === 'test') {
            setTestTitle(data.title);
            try {
              const parsedQuestions = JSON.parse(data.content) as Question[];
              setTestQuestions(parsedQuestions);
            } catch (error) {
              console.error("Failed to parse test content:", error);
              setTestQuestions([]); // Fallback to empty questions if parsing fails
            }
          }
        }
      });
    }
  }, [lessonId, store, setFields]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && lessonId) {
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
        alert('Недопустимый тип файла. Разрешены только изображения, видео и документы (pdf, doc, xls, ppt).');
        e.target.value = '';
        return;
      }

      const newMaterial = await store.uploadLessonMaterial(Number(lessonId), file);
      if (newMaterial) {
        setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
      }
      e.target.value = '';
    }
  };

  const handleCreateModule = async () => {
    if (newModuleName.trim() !== '' && courseId) {
      if (newModuleName.charAt(0) !== newModuleName.charAt(0).toUpperCase()) {
        alert('Название модуля должно начинаться с большой буквы.');
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
        alert('Пожалуйста, выберите файл изображения.');
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

  const handleDeleteMaterial = async (materialId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      await store.deleteLessonMaterial(materialId);
      setMaterials(materials.filter(m => m.id !== materialId));
    }
  };

  // Test specific handlers
  const addQuestion = () => {
    setTestQuestions([
      ...testQuestions,
      {
        id: Date.now().toString(),
        text: '',
        type: 'single',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ],
        isRequired: true
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setTestQuestions(testQuestions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setTestQuestions(testQuestions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string) => {
    setTestQuestions(
      testQuestions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { id: Date.now().toString(), text: '', isCorrect: false }]
          };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<Option>) => {
    setTestQuestions(
      testQuestions.map(q => {
        if (q.id === questionId) {
          const newOptions = q.options.map(o => {
            if (o.id === optionId) {
              return { ...o, ...updates };
            }
            if (updates.isCorrect && q.type === 'single' && o.id !== optionId) {
              return { ...o, isCorrect: false };
            }
            return o;
          });
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setTestQuestions(
      testQuestions.map(q => {
        if (q.id === questionId && q.options.length > 2) {
          return { ...q, options: q.options.filter(o => o.id !== optionId) };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId) return;

    let finalTitle = fields.title;
    let finalContent = fields.content;
    let finalImageUrl = imagePreview;
    let finalModuleId = fields.moduleId === '' ? null : fields.moduleId;

    if (fields.type === 'test') {
      if (testTitle.charAt(0) !== testTitle.charAt(0).toUpperCase()) {
        alert('Название теста должно начинаться с большой буквы.');
        return;
      }
      const isValid = testQuestions.every(q => q.text && q.options.some(o => o.isCorrect) && q.options.every(o => o.text));
      if (!isValid) {
        alert('Пожалуйста, заполните все вопросы теста и отметьте правильные ответы.');
        return;
      }
      finalTitle = testTitle;
      finalContent = JSON.stringify(testQuestions);
      finalImageUrl = null; // Tests don't have images
    } else {
      if (fields.title.charAt(0) !== fields.title.charAt(0).toUpperCase()) {
        alert('Название урока должно начинаться с большой буквы.');
        return;
      }
      if (fields.content && fields.content.charAt(0) !== fields.content.charAt(0).toUpperCase()) {
        alert('Описание урока должно начинаться с большой буквы.');
        return;
      }

      if (fields.image) {
        const formData = new FormData();
        formData.append('file', fields.image);
        const response = await $api.post<{ url: string }>('/upload', formData);
        finalImageUrl = response.data.url;
      }
    }

    await store.updateLesson(lessonId, finalTitle, finalContent, finalModuleId, finalImageUrl, fields.type);
    navigate(`/teacher/lesson/${lessonId}`);
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
        <TeacherHeader name={`Редактирование ${typeNames[fields.type] || 'урока'}`} />
        <div className="teacher-courses-page">
          {fields.type === 'test' ? (
            <form onSubmit={handleSubmit} className="create-test-container">
              <div className="test-base-info card">
                <div className="form-group">
                  <label>Название теста</label>
                  <input 
                    type="text" 
                    value={testTitle} 
                    onChange={(e) => setTestTitle(e.target.value)} 
                    placeholder="Например: Итоговый тест по модулю 1"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Модуль</label>
                  <select value={fields.moduleId} onChange={handleChange('moduleId')}>
                    <option value="">Без модуля</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="questions-list">
                {testQuestions.map((q, questionIndex) => (
                  <div key={q.id} className="question-card card">
                    <div className="question-header">
                      <span className="question-number">Вопрос {questionIndex + 1}</span>
                      <button type="button" className="remove-btn" onClick={() => removeQuestion(q.id)}>
                        <Icon icon="mdi:close" />
                      </button>
                    </div>
                    <div className="form-group">
                      <label>Текст вопроса:</label>
                      <textarea 
                        value={q.text} 
                        onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                        placeholder="Например: Какой язык программирования используется во Frontend?"
                        required
                      />
                    </div>
                    <div className="question-settings">
                      <div className="setting-item">
                        <label>Тип вопроса:</label>
                        <select 
                          value={q.type} 
                          onChange={(e) => updateQuestion(q.id, { type: e.target.value as 'single' | 'multiple' })}
                        >
                          <option value="single">Один правильный ответ</option>
                          <option value="multiple">Несколько правильных ответов</option>
                        </select>
                      </div>
                      <div className="setting-item checkbox">
                        <input 
                          type="checkbox" 
                          checked={q.isRequired}
                          onChange={(e) => updateQuestion(q.id, { isRequired: e.target.checked })}
                          id={`isRequired-${q.id}`}
                        />
                        <label htmlFor={`isRequired-${q.id}`}>Обязательный вопрос</label>
                      </div>
                    </div>

                    <div className="options-list">
                      <label>Варианты ответов:</label>
                      {q.options.map((o) => (
                        <div key={o.id} className="option-item">
                          <input 
                            type={q.type === 'single' ? 'radio' : 'checkbox'} 
                            name={`correct-${q.id}`}
                            checked={o.isCorrect}
                            onChange={(e) => updateOption(q.id, o.id, { isCorrect: e.target.checked })}
                          />
                          <input 
                            type="text" 
                            placeholder="Вариант ответа" 
                            value={o.text}
                            onChange={(e) => updateOption(q.id, o.id, { text: e.target.value })}
                            required
                          />
                          <button type="button" className="remove-option" onClick={() => removeOption(q.id, o.id)}>
                            <Icon icon="mdi:close" />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="add-option-btn" onClick={() => addOption(q.id)}>
                        <Icon icon="mdi:plus" /> Добавить вариант
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="test-actions">
                <button type="button" className="secondary-btn" onClick={addQuestion}>
                  <Icon icon="mdi:plus" /> Добавить вопрос
                </button>
                <button type="submit" className="primary-btn">
                  Сохранить изменения
                </button>
              </div>
            </form>
          ) : (
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
                    Добавить материал
                  </label>
                  <input
                    type="file"
                    id="file"
                    className="file-upload-input"
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  />
                  <span className="file-upload-name">
                    {fields.file ? fields.file.name : 'Файл не выбран'}
                  </span>
                </div>
                <div className="materials-list">
                  {materials.map(material => (
                    <div key={material.id} className="material-item">
                      <div>
                        <a href={material.file_url} target="_blank" rel="noopener noreferrer">{material.title}</a>
                      </div>
                      <button type="button" className="lesson-action-btn delete" onClick={() => handleDeleteMaterial(material.id)}>Удалить</button>
                    </div>
                  ))}
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

              <button type="submit" className="auth-submit-button full-width">Сохранить изменения</button>
            </form>
          )}

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

export default observer(EditLesson);