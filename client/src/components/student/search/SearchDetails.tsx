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

  // Mock data for mentor for now
  const mentor = {
      name: 'Нина Ким',
      role: 'Веб/мобильный разработчик',
      avatar: null, // или 'https://via.placeholder.com/50'
      description: 'Ваш эксперт-наставник в области веб- и мобильной разработки. Обладая богатым опытом, Анастасия помогает начинающим разработчикам пройти сложный путь создания динамичных и отзывчивых приложений.',
      rating: 4.9,
      reviewsCount: 120
  };

  const courseIdNum = Number(id);

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
                    <p className="mentor-role">{mentor.role}</p>
                </div>
            </div>
            <p className="mentor-description">{mentor.description}</p>
            <div className="mentor-rating">
                <Icon icon="mdi:star" />
                <span>{mentor.rating}/5 ({mentor.reviewsCount} отзывов)</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default observer(SearchDetails);
