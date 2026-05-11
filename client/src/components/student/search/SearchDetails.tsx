import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './SearchDetails.css';
import { ISearchDetails } from '../../../models/ICourseDetail';
import Loader from '../../common/Loader';
const SearchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorite, setIsFavorite] = useState(false);

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

  const isFreeCourse =
    course.price === null ||
    course.price === undefined ||
    Number(course.price) === 0;

  const isPaidCourse = !isFreeCourse;

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

  const handleAddToCart = () => {
    // TODO: API корзины
    console.log('Добавить в корзину', courseIdNum);
  };

  return (
    <div className="course-details-page">
      <div className="course-details-left-col">
        <div className="course-content-panel">
          <h2>{course.title}</h2>
          <img src={course.image_url || 'https://via.placeholder.com/800x400'} alt={course.title} className="course-details-image" />
          <div className="course-details-tabs">
              <button className={`tab-button ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Описание</button>
              <button className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Отзывы</button>
          </div>
          <div className="course-details-tab-content">
              {activeTab === 'description' && <p>{course.description}</p>}
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
                  <>
                    <button type="button" className="cart-icon-button" onClick={handleAddToCart}>
                      <Icon icon="mdi:cart-outline" />
                    </button>
                    <button type="button" className="add-to-cart-button" onClick={handleAddToCart}>
                      Добавить в корзину
                    </button>
                  </>
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
                    {mentor.avatar ? (
                        <img src={mentor.avatar} alt={course.author_name ?? 'Автор'} />
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
