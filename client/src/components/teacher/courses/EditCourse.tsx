import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { useFormFields } from '../../../hooks/useFormFields';
import '../dashboard/TeacherLayout.css';
import './CreateCourse.css';

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const { fields, handleChange, setFieldValue, setFields } = useFormFields({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
    image: null as File | null,
    price: 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      store.getCourseDetails(Number(id)).then(data => {
        if (data) {
          setFields({
            title: data.title,
            description: data.description,
            status: data.status,
            price: data.price ?? 0,
            image: null,
          });
          setImagePreview(data.image_url || null);
        }
      });
    }
  }, [id, store, setFields]);

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
    if (!id) return;

    if (fields.title.charAt(0) !== fields.title.charAt(0).toUpperCase()) {
      alert('Название курса должно начинаться с большой буквы.');
      return;
    }
    if (fields.description && fields.description.charAt(0) !== fields.description.charAt(0).toUpperCase()) {
      alert('Описание курса должно начинаться с большой буквы.');
      return;
    }

    await store.updateCourse(Number(id), fields.title, fields.description, fields.status, fields.image, fields.price, imagePreview);
    navigate(`/teacher/course/${id}`);
  };

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name="Редактирование курса" />
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
              <label htmlFor="price">Цена</label>
              <input
                type="number"
                id="price"
                value={fields.price}
                onChange={handleChange('price')}
              />
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
                {imagePreview && <img src={imagePreview} alt="Превью" className="file-upload-preview" />}
              </div>
            </div>
            <button type="submit" className="auth-submit-button full-width">Сохранить изменения</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default observer(EditCourse);