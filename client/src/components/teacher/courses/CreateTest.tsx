import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { Icon } from '@iconify/react';
import { Module } from '../../../models/ICourseDetail';
import $api from '../../../http';
import './CreateTest.css';

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
  imageUrl: string | null;
}

const CreateTest: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: Date.now().toString(),
      text: '',
      type: 'single',
      options: [
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
      ],
      isRequired: true,
      imageUrl: null
    }
  ]);

  useEffect(() => {
    if (courseId) {
      store.getCourseDetails(Number(courseId)).then(data => {
        if (data) setModules(data.modules);
      });
    }
  }, [courseId, store]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: '',
        type: 'single',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ],
        isRequired: true,
        imageUrl: null
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
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
    setQuestions(
      questions.map(q => {
        if (q.id === questionId) {
          const newOptions = q.options.map(o => {
            if (o.id === optionId) {
              return { ...o, ...updates };
            }
            // Если тип вопроса 'single' и мы ставим правильный ответ, убираем его у других
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
    setQuestions(
      questions.map(q => {
        if (q.id === questionId && q.options.length > 2) {
          return { ...q, options: q.options.filter(o => o.id !== optionId) };
        }
        return q;
      })
    );
  };

  const handleQuestionImageChange = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.split('/')[0] !== 'image') {
      alert('Пожалуйста, выберите файл изображения.');
      e.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await $api.post<{ url: string }>('/upload', formData);
      updateQuestion(questionId, { imageUrl: response.data.url });
    } catch (error) {
      console.error('Failed to upload question image:', error);
      alert('Ошибка при загрузке изображения.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    // Валидация
    const isValid = questions.every(q => q.text && q.options.some(o => o.isCorrect) && q.options.every(o => o.text));
    if (!isValid) {
      alert('Пожалуйста, заполните все вопросы и отметьте правильные ответы.');
      return;
    }

    try {
      const selectedModuleId = moduleId === '' ? null : moduleId;
      // Сохраняем тест как урок типа 'test'
      // Контент урока будет содержать JSON структуру теста
      const testContent = JSON.stringify(questions);
      
      const newLesson = await store.createLesson(
        courseId, 
        selectedModuleId, 
        title, 
        testContent, 
        null, 
        'test'
      );

      if (newLesson) {
        navigate(`/teacher/course/${courseId}`);
      }
    } catch (error) {
      console.error('Failed to create test:', error);
    }
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name="Конструктор теста" />
        <div className="create-test-container">
          <form onSubmit={handleSubmit}>
            <div className="test-base-info card">
              <div className="form-group">
                <label>Название теста</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Например: Итоговый тест по модулю 1"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Модуль</label>
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)}>
                  <option value="">Без модуля</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="questions-list">
              {questions.map((q, index) => (
                <div key={q.id} className="question-card card">
                  <div className="question-header">
                    <span className="question-number">Вопрос {index + 1}</span>
                    <button type="button" className="remove-btn" onClick={() => removeQuestion(q.id)}>
                      <Icon icon="mdi:trash-can-outline" />
                    </button>
                  </div>

                  <div className="form-group">
                    <textarea 
                      placeholder="Введите текст вопроса" 
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Изображение к вопросу</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        id={`question-image-${q.id}`}
                        className="file-upload-input"
                        onChange={(e) => handleQuestionImageChange(q.id, e)}
                        accept="image/*"
                      />
                      <label htmlFor={`question-image-${q.id}`} className="file-upload-button">
                        Выберите изображение
                      </label>
                      <span className="file-upload-name">
                        {q.imageUrl ? 'Изображение загружено' : 'Файл не выбран'}
                      </span>
                    </div>
                    {q.imageUrl && (
                      <div className="question-image-preview">
                        <img src={q.imageUrl} alt="Изображение к вопросу" />
                        <button 
                          type="button" 
                          className="remove-btn"
                          onClick={() => updateQuestion(q.id, { imageUrl: null })}
                        >
                          <Icon icon="mdi:close" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="question-settings">
                    <div className="setting-item">
                      <label>Тип ответа:</label>
                      <select 
                        value={q.type} 
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                      >
                        <option value="single">Один правильный ответ</option>
                        <option value="multiple">Несколько правильных ответов</option>
                      </select>
                    </div>
                    <div className="setting-item checkbox">
                      <input 
                        type="checkbox" 
                        id={`req-${q.id}`} 
                        checked={q.isRequired}
                        onChange={(e) => updateQuestion(q.id, { isRequired: e.target.checked })}
                      />
                      <label htmlFor={`req-${q.id}`}>Обязательный вопрос</label>
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
                Создать тест
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default observer(CreateTest);
