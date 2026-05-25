import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './StudentCoursesSearch.css';
import { useNavigate } from 'react-router-dom';
import { formatCoursePriceDisplay, parseCoursePrice } from '../../../utils/coursePrice';
import { loadFavoriteCourseIds, saveFavoriteCourseIds } from '../../../utils/courseFavorites';
import { CourseSearchStars } from '../../../utils/courseRatingStars';
import { getCourseCoverUrl } from '../../../constants/courseCover';
import { COURSE_SEARCH_CATEGORIES } from '../../../constants/courseCategories';

type CourseListFilter = 'all' | 'free' | 'paid' | 'favorites';

const DEFAULT_FILTERS = {
  category: 'Все',
  listFilter: 'all' as CourseListFilter,
  priceMin: '',
  priceMax: '',
};

function coursePriceValue(course: ICourse): number {
  return parseCoursePrice(course.price);
}

const StudentCoursesSearch: React.FC = () => {
  const { store } = useContext(Context);
  const [activeCategory, setActiveCategory] = useState(DEFAULT_FILTERS.category);
  const [listFilter, setListFilter] = useState<CourseListFilter>(DEFAULT_FILTERS.listFilter);
  const [priceMin, setPriceMin] = useState(DEFAULT_FILTERS.priceMin);
  const [priceMax, setPriceMax] = useState(DEFAULT_FILTERS.priceMax);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [favoriteCourseIds, setFavoriteCourseIds] = useState<number[]>(() => loadFavoriteCourseIds());
  const navigate = useNavigate();

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  useEffect(() => {
    saveFavoriteCourseIds(favoriteCourseIds);
  }, [favoriteCourseIds]);

  useEffect(() => {
    if (!isFilterDrawerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFilterDrawerOpen(false);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFilterDrawerOpen]);

  const isEnrolled = (courseId: number): boolean => {
    return store.user.courses?.some((course) => Number(course.id) === courseId) || false;
  };

  const toggleFavorite = (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const hasActiveFilters =
    activeCategory !== DEFAULT_FILTERS.category ||
    listFilter !== DEFAULT_FILTERS.listFilter ||
    priceMin !== '' ||
    priceMax !== '';

  const resetFilters = useCallback(() => {
    setActiveCategory(DEFAULT_FILTERS.category);
    setListFilter(DEFAULT_FILTERS.listFilter);
    setPriceMin(DEFAULT_FILTERS.priceMin);
    setPriceMax(DEFAULT_FILTERS.priceMax);
  }, []);

  const parsedPriceMin = priceMin === '' ? null : parseCoursePrice(priceMin);
  const parsedPriceMax = priceMax === '' ? null : parseCoursePrice(priceMax);

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...store.courses];

    if (activeCategory !== 'Все') {
      result = result.filter((course) => course.category === activeCategory);
    }

    if (listFilter === 'favorites') {
      result = result.filter((course) => favoriteCourseIds.includes(course.id));
    } else if (listFilter === 'free') {
      result = result.filter((course) => coursePriceValue(course) <= 0);
    } else if (listFilter === 'paid') {
      result = result.filter((course) => coursePriceValue(course) > 0);
    }

    if (parsedPriceMin != null) {
      result = result.filter((course) => coursePriceValue(course) >= parsedPriceMin);
    }
    if (parsedPriceMax != null) {
      result = result.filter((course) => coursePriceValue(course) <= parsedPriceMax);
    }

    return result;
  }, [
    store.courses,
    activeCategory,
    listFilter,
    favoriteCourseIds,
    parsedPriceMin,
    parsedPriceMax,
  ]);

  return (
    <div className="student-courses-page">
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

      {isFilterDrawerOpen && (
        <div
          className="courses-filter-drawer-backdrop"
          role="presentation"
          onClick={() => setIsFilterDrawerOpen(false)}
        />
      )}

      <aside
        className={`courses-filter-drawer ${isFilterDrawerOpen ? 'courses-filter-drawer--open' : ''}`}
        aria-hidden={!isFilterDrawerOpen}
        aria-label="Фильтры курсов"
      >
        <div className="courses-filter-drawer-header">
          <h3>Фильтры</h3>
          <button
            type="button"
            className="courses-filter-drawer-close"
            onClick={() => setIsFilterDrawerOpen(false)}
            aria-label="Закрыть"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div className="courses-filter-drawer-body">
          <section className="courses-filter-section">
            <h4>Категория</h4>
            <select
              className="courses-filter-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {COURSE_SEARCH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </section>

          <section className="courses-filter-section">
            <h4>Тип курса</h4>
            <div className="courses-filter-options">
              <button
                type="button"
                className={`courses-filter-option ${listFilter === 'all' ? 'active' : ''}`}
                onClick={() => setListFilter('all')}
              >
                Все курсы
              </button>
              <button
                type="button"
                className={`courses-filter-option ${listFilter === 'free' ? 'active' : ''}`}
                onClick={() => setListFilter('free')}
              >
                Бесплатные
              </button>
              <button
                type="button"
                className={`courses-filter-option ${listFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setListFilter('paid')}
              >
                Платные
              </button>
              <button
                type="button"
                className={`courses-filter-option ${listFilter === 'favorites' ? 'active' : ''}`}
                onClick={() => setListFilter('favorites')}
              >
                Понравившиеся
              </button>
            </div>
          </section>

          <section className="courses-filter-section">
            <h4>Цена (Б)</h4>
            <div className="courses-filter-price-row">
              <label className="courses-filter-price-field">
                <span>От</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className="courses-filter-price-field">
                <span>До</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="∞"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="courses-filter-drawer-footer">
          <button
            type="button"
            className="courses-filter-reset"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Сбросить
          </button>
          <button
            type="button"
            className="courses-filter-apply"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            Показать ({filteredAndSortedCourses.length})
          </button>
        </div>
      </aside>

      <div className="courses-main-layout">
        <div className="courses-main-content">
          {filteredAndSortedCourses.length === 0 ? (
            <div className="teacher-courses-empty">
              <h2>
                {listFilter === 'favorites'
                  ? 'У вас пока нет понравившихся курсов. Нажмите на сердечко у карточки курса.'
                  : 'По выбранным фильтрам ничего не найдено.'}
              </h2>
            </div>
          ) : (
            <div className="teacher-courses-grid">
              {filteredAndSortedCourses.map((course: ICourse) => (
                <Link
                  to={`/student/search/${course.id}`}
                  key={course.id}
                  className="student-course-card-link"
                >
                  <div className="student-course-card">
                    <div className="student-course-card-header">
                      <img
                        src={getCourseCoverUrl(course.image_url)}
                        alt={course.title}
                        className="student-course-card-img"
                      />
                      <button
                        type="button"
                        className={`card-favorite-button ${favoriteCourseIds.includes(course.id) ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(e, course.id)}
                      >
                        <Icon
                          icon={
                            favoriteCourseIds.includes(course.id)
                              ? 'mdi:heart'
                              : 'mdi:heart-outline'
                          }
                        />
                      </button>
                    </div>
                    <div className="student-course-card-info">
                      <h3 className="student-course-card-title">{course.title}</h3>
                      <p className="student-course-card-description">
                        {course.description || '\u00A0'}
                      </p>
                      <div className="student-course-card-author">
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
                      <div className="student-course-card-footer">
                        <CourseSearchStars
                          course={course}
                          className="student-search-card-stars"
                        />
                        <span className="student-course-price">
                          {formatCoursePriceDisplay(course.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="courses-toolbar-side">
          <button
            type="button"
            className={`courses-settings-btn ${isFilterDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label="Фильтры курсов"
            aria-expanded={isFilterDrawerOpen}
          >
            <Icon icon="solar:settings-linear" />
            {hasActiveFilters && <span className="courses-settings-badge" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(StudentCoursesSearch);
