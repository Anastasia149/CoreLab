import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './SearchDetails.css';
import { ISearchDetails } from '../../../models/ICourseDetail';
import Loader from '../../common/Loader';
import { addCourseToCart, isCourseInCart, removeCourseFromCart } from '../../../utils/courseCart';
import { isPaidCoursePrice } from '../../../utils/coursePrice';
import { getCourseCoverUrl } from '../../../constants/courseCover';
import { CourseReviewsPanel } from '../../common/CourseReviewsPanel';
const SearchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (id) {
      store.getCourseDetails(Number(id)).then(data => {
        if (data) {
          setCourse(data);
        }
        setLoading(false);
      });
    }
  }, [id, store]);

  useEffect(() => {
    const userId = store.user?.id;
    if (!userId || !id) {
      setInCart(false);
      return;
    }
    setInCart(isCourseInCart(userId, Number(id)));
  }, [id, store.user?.id]);

  if (loading) {
    return <Loader size="full-page" />;
  }

  if (!course) {
    return <div>Курс не найден</div>;
  }

  const courseIdNum = Number(id);

  const authorAbout = course.author_about_me?.trim() || '';
  const authorReviewsCount = Number(course.author_reviews_count) || 0;
  const authorAverageRating =
    authorReviewsCount > 0
      ? Number(course.author_average_rating ?? 0).toFixed(1)
      : '5.0';

  const reviewsCountLabel =
    authorReviewsCount === 1
      ? '1 отзыв'
      : authorReviewsCount > 1 && authorReviewsCount < 5
        ? `${authorReviewsCount} отзыва`
        : `${authorReviewsCount} отзывов`;

  const isPaidCourse = isPaidCoursePrice(course.price);
  const isFreeCourse = !isPaidCourse;

  const alreadyEnrolled =
    store.user?.courses?.some((c) => Number(c.id) === courseIdNum) ?? false;

  const navigateToCoursePage = () => {
    // В App.tsx маршрут courses/:id ведёт на SearchDetails; страница прохождения курса — my-courses/:id
    navigate(`/student/my-courses/${courseIdNum}`);
  };

  /** Бесплатный: при первом входе записывает; если уже на курсе — только переход. Купленный платный — только переход. */
  const handleGoToCourse = async () => {
    if (!course) return;

    if (alreadyEnrolled) {
      navigateToCoursePage();
      return;
    }

    if (isFreeCourse) {
      try {
        await store.enrollCourse(courseIdNum);
        navigateToCoursePage();
      } catch (error) {
        console.error('Ошибка при зачислении:', error);
        // Уже записан на сервере, но список курсов в store ещё не обновлён — всё равно ведём на курс
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 409 || status === 400) {
          navigateToCoursePage();
        }
      }
      return;
    }

    navigateToCoursePage();
  };

  const handleCartToggle = () => {
    const userId = store.user?.id;
    if (!userId) return;

    if (inCart) {
      const next = removeCourseFromCart(userId, courseIdNum);
      setInCart(next.includes(courseIdNum));
      return;
    }

    const next = addCourseToCart(userId, courseIdNum);
    setInCart(next.includes(courseIdNum));
  };

  return (
    <div className="course-details-page">
      <div className="course-details-left-col">
        <div className="course-content-panel">
          <h2>{course.title}</h2>
          <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="course-details-image" />
          <div className="course-details-tabs">
              <button className={`tab-button ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Описание</button>
              <button className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Отзывы</button>
          </div>
          <div className="course-details-tab-content">
              {activeTab === 'description' && <p>{course.description}</p>}
              {activeTab === 'reviews' && (
                <CourseReviewsPanel courseId={courseIdNum} active readOnly />
              )}
          </div>
        </div>
      </div>

      <div className="course-details-right-col">
        <div className="course-overview-card course-overview-card--actions">
            <div className="course-actions">
                <button 
                  className={`favorite-icon-button ${isFavorite ? 'active' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Icon icon={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'} />
                </button>
                {isPaidCourse && !alreadyEnrolled ? (
                  <button
                    type="button"
                    className={`add-to-cart-button ${inCart ? 'in-cart' : ''}`}
                    onClick={handleCartToggle}
                  >
                    {inCart ? 'В корзине' : 'Добавить в корзину'}
                  </button>
                ) : (
                  <button type="button" className="go-to-course-button" onClick={handleGoToCourse}>
                    Перейти к курсу
                  </button>
                )}
            </div>
        </div>

        <div className="mentor-card">
            <h4>О менторе</h4>
            <div className="mentor-info">
                <div className="mentor-avatar">
                    {course.author_avatar ? (
                        <img src={course.author_avatar} alt={course.author_name ?? 'Автор'} />
                    ) : (
                        <Icon icon="solar:user-linear" />
                    )}
                </div>
                <div>
                    <h5>{course.author_name}</h5>
                </div>
            </div>
            {authorAbout ? (
              <p className="mentor-description">{authorAbout}</p>
            ) : (
              <p className="mentor-description mentor-description--empty">
                Преподаватель пока не заполнил раздел «О себе» в профиле.
              </p>
            )}
            <div className="mentor-rating">
                <div className="mentor-rating-score">
                  <Icon icon="mdi:star" aria-hidden />
                  <span className="mentor-rating-value">{authorAverageRating}</span>
                  <span className="mentor-rating-max">из 5</span>
                </div>
                <span className="mentor-rating-count">({reviewsCountLabel})</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default observer(SearchDetails);
