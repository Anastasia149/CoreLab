import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { useFormFields } from '../../../hooks/useFormFields';
import '../dashboard/TeacherLayout.css';
import './CreateCourse.css';

import { useNavigate } from 'react-router-dom';
import { parseCoursePrice, validateCoursePrice } from '../../../utils/coursePrice';
import { DEFAULT_COURSE_COVER } from '../../../constants/courseCover';

const CreateCourse: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const { fields, handleChange, setFieldValue } = useFormFields({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    image: null as File | null,
    price: 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Clean up the object URL on unmount
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fields.title.charAt(0) !== fields.title.charAt(0).toUpperCase()) {
      alert('Название курса должно начинаться с большой буквы.');
      return;
    }
    if (fields.description && fields.description.charAt(0) !== fields.description.charAt(0).toUpperCase()) {
      alert('Описание курса должно начинаться с большой буквы.');
      return;
    }

    const priceError = validateCoursePrice(fields.price);
    if (priceError) {
      alert(priceError);
      return;
    }

    const price = parseCoursePrice(fields.price);
    await store.createCourse(fields.title, fields.description, fields.status, fields.image, price);
    navigate('/teacher/courses');
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name="Создание нового курса" />
        <div className="teacher-courses-page">
          <form className="create-course-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Название курса</label>
              <input
                type="text"
                id="title"
                value={fields.title}
                onChange={handleChange('title')}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                value={fields.description}
                onChange={handleChange('description')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Цена (Б)</label>
              <input
                type="number"
                id="price"
                min={0}
                step={0.01}
                value={fields.price}
                onChange={(e) => {
                  const next = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  setFieldValue('price', Number.isNaN(next) ? 0 : Math.max(0, next));
                }}
              />
              <p className="form-hint">0 — бесплатный курс. Отрицательная цена недоступна.</p>
            </div>
            <div className="form-group">
              <label htmlFor="status">Статус</label>
              <select id="status" value={fields.status} onChange={handleChange('status')}>
                <option value="draft">Черновик</option>
                <option value="published">Опубликовать</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Обложка курса</label>
              <div className="file-upload-wrapper">
                <label htmlFor="image" className="file-upload-button">
                  Выберите файл
                </label>
                <input
                  type="file"
                  id="image"
                  className="file-upload-input"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <span className="file-upload-name">
                  {fields.image ? fields.image.name : 'Файл не выбран'}
                </span>
                <img
                  src={imagePreview || DEFAULT_COURSE_COVER}
                  alt="Превью обложки"
                  className="file-upload-preview"
                />
              </div>
            </div>
            <button type="submit" className="auth-submit-button full-width">Создать курс</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default observer(CreateCourse);
