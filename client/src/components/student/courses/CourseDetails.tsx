import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './CourseDetails.css';
import { ICourse } from '../../../models/ICourse';
import Loader from '../../common/Loader';

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('CourseDetails mounted, id:', id);
    if (id) {
      store.getCourseById(id).then(data => {
        console.log('Data received from store:', data);
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

  return (
    <div className="course-details-page">
      <div className="course-details-left-col">
        <div className="course-content-panel">
          <h2>{course.title}</h2>
          <img src={course.image_url} alt={course.title} className="course-details-image" />
          <div className="course-details-tabs">
              <button className="tab-button active">Описание</button>
              <button className="tab-button">Инструменты</button>
              <button className="tab-button">Отзывы</button>
              <button className="tab-button">Сокурсники</button>
          </div>
          <div className="course-details-tab-content">
              <p>{course.description}</p>
          </div>
        </div>
      </div>

      <div className="course-details-right-col">
        <div className="course-overview-card">
            <h4>Обзор</h4>
            <div className="overview-grid">
                <div className="stat-card">
                    <Icon icon="mdi:account-group-outline" />
                    <div className="stat-number">0</div>
                    <div className="stat-label">студентов</div>
                </div>
                <div className="stat-card">
                    <Icon icon="mdi:book-open-page-variant-outline" />
                    <div className="stat-number">{course.lessons_count}</div>
                    <div className="stat-label">модулей</div>
                </div>
                <div className="stat-card">
                    <Icon icon="mdi:play-circle-outline" />
                    <div className="stat-number">{course.lessons_count}</div>
                    <div className="stat-label">видео</div>
                </div>
                <div className="stat-card">
                    <Icon icon="mdi:star-outline" />
                    <div className="stat-number">0</div>
                    <div className="stat-label">отзывов</div>
                </div>
            </div>
            <div className="price-section">
                <span>Цена</span>
                <span className="price-amount">{course.price}$</span>
            </div>
            <div className="course-actions">
                <button className="cart-icon-button"><Icon icon="mdi:cart-outline" /></button>
                <button className="add-to-cart-button">Добавить в корзину</button>
            </div>
        </div>

        <div className="mentor-card">
            <h4>О менторе</h4>
            <div className="mentor-info">
                <div className="mentor-avatar">
                    {mentor.avatar ? (
                        <img src={mentor.avatar} alt={course.author_name} />
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

export default observer(CourseDetails);
