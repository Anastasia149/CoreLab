import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './StudentCourses.css';

const StudentCourses: React.FC = () => {
  const { store } = useContext(Context);

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  return (
    <div className="student-courses-page">
      {/* Промо-баннер */}
      <div className="courses-promo-banner">
        <div className="promo-text">
          <h2>Исследуйте мир курсов</h2>
          <p>Только для вас. Начните свое путешествие в мир знаний и роста!</p>
        </div>
        <div className="promo-stats">
          <div className="stat-item">
            <div className="count">1,500+</div>
            <div className="label">Курсов</div>
          </div>
          <div className="stat-item">
            <div className="count">200+</div>
            <div className="label">Наставников</div>
          </div>
          <div className="stat-item">
            <div className="count">10,000+</div>
            <div className="label">Студентов</div>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="courses-filter-panel">
        <button className="filter-button active">Анализ трендов</button>
        <button className="filter-button">IT и ПО</button>
        <button className="filter-button">Дизайн</button>
        <button className="filter-button">Маркетинг</button>
        <button className="filter-button">Наука</button>
        <button className="filter-button">Право</button>
      </div>

      {/* Сетка курсов */}
      {store.courses.length === 0 ? (
        <div className="teacher-courses-empty">
          <h2>Пока нет доступных курсов.</h2>
        </div>
      ) : (
        <div className="teacher-courses-grid">
          {store.courses.map((course: ICourse) => (
            <Link to={`/student/courses/${course.id}`} key={course.id} className="student-course-card-link">
              <div className="student-course-card">
                <img src={course.image_url} alt={course.title} className="student-course-card-img" />
                <div className="student-course-card-info">
                  <h3>{course.title}</h3>
                  <div className="student-course-rating">
                    <Icon icon="mdi:star" />
                    <Icon icon="mdi:star" />
                    <Icon icon="mdi:star" />
                    <Icon icon="mdi:star" />
                    <Icon icon="mdi:star-outline" />
                  </div>
                  <div className="student-course-author">
                    <div className="author-icon"></div>
                    <span>{course.author_name}</span>
                    <span className="student-course-price">{course.price} BYN</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default observer(StudentCourses);
