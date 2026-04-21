import React, { useContext, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Context } from '../../index';
import { observer } from 'mobx-react-lite';
import { ICourse } from '../../models/ICourse';
import { useNavigate } from 'react-router-dom';

const HomeTracks: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || numPrice === 0) return 'Бесплатно';
    return `${numPrice.toLocaleString('ru-RU')} BYN`;
  };

  const formatStudents = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <section className="home-tracks">
      <h2 className="home-section-title">Самые популярные онлайн-курсы</h2>
      
      {store.courses.length === 0 ? (
        <div className="home-no-courses">Загрузка популярных курсов...</div>
      ) : (
        <div className="home-track-grid">
          {store.courses.slice(0, 8).map((course: ICourse) => (
            <div 
              className="home-course-card" 
              key={course.id}
              onClick={() => navigate('/register')}
            >
              <div className="home-course-image-wrapper">
                <img src={course.image_url || 'https://via.placeholder.com/300x180'} alt={course.title} className="home-course-image" />
                <button className="home-course-favorite">
                  <Icon icon="mdi:heart-outline" />
                </button>
              </div>
              
              <div className="home-course-content">
                <h3 className="home-course-title">{course.title}</h3>
                <div className="home-course-author">{course.author_name || 'Инструктор'}</div>
                
                <div className="home-course-stats">
                  <div className="home-course-rating">
                    <Icon icon="mdi:star" className="star-icon" />
                    <span>4.9</span>
                  </div>
                  <div className="home-course-students">
                    <Icon icon="mdi:account-outline" />
                    <span>{formatStudents(course.students_count)}</span>
                  </div>
                  <div className="home-course-duration">
                    <Icon icon="mdi:clock-outline" />
                    <span>12 ч</span>
                  </div>
                </div>
                
                <div className="home-course-footer">
                  <div className="home-course-price">{formatPrice(course.price)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default observer(HomeTracks);
