import React, { useContext, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './StudentCourses.css';

const categories = [
  'Все',
  'IT и ПО',
  'Дизайн',
  'Маркетинг',
  'Наука',
  'Право',
  'Тесты',
  'Интенсивы'
];

const StudentCourses: React.FC = () => {
  const { store } = useContext(Context);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [priceSort, setPriceSort] = useState<'all' | 'free' | 'paid'>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>([]);

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const toggleFavorite = (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteCourseIds(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId]
    );
  };

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...store.courses];

    // Фильтрация по категории (имитация, так как в модели ICourse может не быть категории)
    if (activeCategory !== 'Все') {
      // Здесь должна быть реальная фильтрация по категории, если она есть в модели
      // result = result.filter(course => course.category === activeCategory);
    }

    // Сортировка/фильтрация по цене - с проверкой типа
    if (priceSort === 'free') {
      result = result.filter(course => {
        const price = Number(course.price);
        return isNaN(price) || price <= 0;
      });
    } else if (priceSort === 'paid') {
      result = result.filter(course => {
        const price = Number(course.price);
        return !isNaN(price) && price > 0;
      });
    }

    return result;
  }, [store.courses, activeCategory, priceSort]);

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

      {/* Панель управления поиском */}
      <div className="courses-controls">
        {/* Панель фильтров категорий */}
        <div className="courses-filter-row">
          <div className="courses-filter-panel">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-button ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="courses-settings-wrapper">
            <button 
              className={`courses-settings-btn ${isSettingsOpen ? 'active' : ''}`}
              onClick={toggleSettings}
              aria-label="Настройки фильтрации"
            >
              <Icon icon="solar:settings-linear" />
            </button>

            {isSettingsOpen && (
              <div className="courses-settings-popup">
                <div className="settings-popup-section">
                  <h4>Цена</h4>
                  <div className="popup-sort-options">
                    <button 
                      className={`popup-sort-option ${priceSort === 'all' ? 'active' : ''}`}
                      onClick={() => { setPriceSort('all'); setIsSettingsOpen(false); }}
                    >
                      Все курсы
                    </button>
                    <button 
                      className={`popup-sort-option ${priceSort === 'free' ? 'active' : ''}`}
                      onClick={() => { setPriceSort('free'); setIsSettingsOpen(false); }}
                    >
                      Бесплатные
                    </button>
                    <button 
                      className={`popup-sort-option ${priceSort === 'paid' ? 'active' : ''}`}
                      onClick={() => { setPriceSort('paid'); setIsSettingsOpen(false); }}
                    >
                      Платные
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Сетка курсов */}
      {filteredAndSortedCourses.length === 0 ? (
        <div className="teacher-courses-empty">
          <h2>По вашему запросу ничего не найдено.</h2>
        </div>
      ) : (
        <div className="teacher-courses-grid">
          {filteredAndSortedCourses.map((course: ICourse) => (
            <Link to={`/student/courses/${course.id}`} key={course.id} className="student-course-card-link">
              <div className="student-course-card">
                <div className="student-course-card-header">
                  <img src={course.image_url || 'https://via.placeholder.com/300x160'} alt={course.title} className="student-course-card-img" />
                  <button 
                    className={`card-favorite-button ${favoriteCourseIds.includes(course.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(e, course.id)}
                  >
                    <Icon icon={favoriteCourseIds.includes(course.id) ? 'mdi:heart' : 'mdi:heart-outline'} />
                  </button>
                </div>
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
                    <span>{course.author_name || 'Инструктор'}</span>
                    <span className="student-course-price">
                      {course.price && course.price > 0 ? `${course.price} BYN` : 'Бесплатно'}
                    </span>
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
