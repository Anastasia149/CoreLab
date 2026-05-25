import React, { useContext, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './StudentCoursesSearch.css';
import { useNavigate } from 'react-router-dom';
import { formatCoursePriceDisplay } from '../../../utils/coursePrice';
import { loadFavoriteCourseIds, saveFavoriteCourseIds } from '../../../utils/courseFavorites';
import { CourseSearchStars } from '../../../utils/courseRatingStars';
import { getCourseCoverUrl } from '../../../constants/courseCover';
import { COURSE_SEARCH_CATEGORIES } from '../../../constants/courseCategories';

type CourseListFilter = 'all' | 'free' | 'paid' | 'favorites';

const StudentCoursesSearch: React.FC = () => {
  const { store } = useContext(Context);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [listFilter, setListFilter] = useState<CourseListFilter>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>(() => loadFavoriteCourseIds());
  const navigate = useNavigate();

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  useEffect(() => {
    saveFavoriteCourseIds(favoriteCourseIds);
  }, [favoriteCourseIds]);

  const isEnrolled = (courseId: number): boolean => {
    return store.user.courses?.some((course) => Number(course.id) === courseId) || false;
  };

  const handleEnroll = async (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await store.enrollCourse(courseId);
      navigate(`/student/my-courses/${courseId}`);
    } catch (error) {
      console.error("Ошибка при записи на курс:", error);
      // Handle error, e.g., show a toast notification
    }
  };

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

    if (activeCategory !== 'Все') {
      result = result.filter((course) => course.category === activeCategory);
    }

    if (listFilter === 'favorites') {
      result = result.filter((course) => favoriteCourseIds.includes(course.id));
    } else if (listFilter === 'free') {
      result = result.filter((course) => {
        const price = Number(course.price);
        return isNaN(price) || price <= 0;
      });
    } else if (listFilter === 'paid') {
      result = result.filter((course) => {
        const price = Number(course.price);
        return !isNaN(price) && price > 0;
      });
    }

    return result;
  }, [store.courses, activeCategory, listFilter, favoriteCourseIds]);

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
            {COURSE_SEARCH_CATEGORIES.map(cat => (
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
                  <h4>Сортировка</h4>
                  <div className="popup-sort-options">
                    <button 
                      className={`popup-sort-option ${listFilter === 'all' ? 'active' : ''}`}
                      onClick={() => { setListFilter('all'); setIsSettingsOpen(false); }}
                    >
                      Все курсы
                    </button>
                    <button 
                      className={`popup-sort-option ${listFilter === 'free' ? 'active' : ''}`}
                      onClick={() => { setListFilter('free'); setIsSettingsOpen(false); }}
                    >
                      Бесплатные
                    </button>
                    <button 
                      className={`popup-sort-option ${listFilter === 'paid' ? 'active' : ''}`}
                      onClick={() => { setListFilter('paid'); setIsSettingsOpen(false); }}
                    >
                      Платные
                    </button>
                    <button 
                      className={`popup-sort-option ${listFilter === 'favorites' ? 'active' : ''}`}
                      onClick={() => { setListFilter('favorites'); setIsSettingsOpen(false); }}
                    >
                      Понравившиеся
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
          <h2>
            {listFilter === 'favorites'
              ? 'У вас пока нет понравившихся курсов. Нажмите на сердечко у карточки курса.'
              : 'По вашему запросу ничего не найдено.'}
          </h2>
        </div>
      ) : (
        <div className="teacher-courses-grid">
          {filteredAndSortedCourses.map((course: ICourse) => {
            const isFreeAndNotEnrolled = store.isAuth && (Number(course.price) === 0 || course.price === null) && !isEnrolled(course.id);

            return (
              <Link to={`/student/search/${course.id}`} key={course.id} className="student-course-card-link">
                <div className="student-course-card">
                  <div className="student-course-card-header">
                    <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="student-course-card-img" />
                    <button 
                      className={`card-favorite-button ${favoriteCourseIds.includes(course.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(e, course.id)}
                    >
                      <Icon icon={favoriteCourseIds.includes(course.id) ? 'mdi:heart' : 'mdi:heart-outline'} />
                    </button>
                  </div>
                  <div className="student-course-card-info">
                    <h3>{course.title}</h3>
                    <p className="student-course-card-description">
                      {course.description || '\u00A0'}
                    </p>
                    <div className="student-course-card-meta">
                      <div className="student-course-meta-left">
                        <div className="student-course-author-row">
                          {course.author_avatar ? (
                            <img
                              src={course.author_avatar}
                              alt=""
                              className="author-avatar student-course-card-avatar"
                            />
                          ) : (
                            <div className="author-icon student-course-card-avatar" aria-hidden>
                              <Icon icon="solar:user-linear" />
                            </div>
                          )}
                          <span className="student-course-author-name">
                            {course.author_name || 'Инструктор'}
                          </span>
                        </div>
                        <CourseSearchStars
                          course={course}
                          className="student-search-card-stars"
                        />
                      </div>
                      <span className="student-course-price">
                        {formatCoursePriceDisplay(course.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default observer(StudentCoursesSearch);
