import React, { useContext, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Context } from '../../index';
import { observer } from 'mobx-react-lite';
import { ICourse } from '../../models/ICourse';
import { useNavigate } from 'react-router-dom';
import './HomeTracks.css';
import { formatCoursePriceDisplay } from '../../utils/coursePrice';
import { getCourseCoverUrl } from '../../constants/courseCover';

const HomeTracks: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  const formatPrice = (price: number | string) => formatCoursePriceDisplay(price);

  const formatStudents = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <section className="home-tracks">
      <div className="home-features-grid">
        <div className="home-feature-item">
          <div className="home-feature-title-box">Курсы</div>
          <p className="home-feature-description">
            Приходите на бесплатные курсы. Поработайте руками — напишите код или протестируйте сайт. Это поможет определиться с дальнейшей карьерой
          </p>
        </div>
        <div className="home-feature-item">
          <div className="home-feature-title-box">Интенсивы</div>
          <p className="home-feature-description">
            Примите участие в бесплатных интенсивах. Это отличная возможность попробовать себя в новой профессии и решить, подходит ли она вам
          </p>
        </div>
      </div>

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
                <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="home-course-image" />
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

      <h2 className="home-section-title" style={{ marginTop: '64px' }}>Бесплатные курсы</h2>
      
      <div className="home-track-grid">
        {/* Dynamic courses from store */}
        {store.courses
          .filter((c: ICourse) => {
            const price = typeof c.price === 'string' ? parseFloat(c.price) : c.price;
            return !price || price === 0;
          })
          .slice(0, 4)
          .map((course: ICourse) => (
            <div 
              className="home-course-card" 
              key={`free-${course.id}`}
              onClick={() => navigate('/register')}
            >
              <div className="home-course-image-wrapper">
                <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="home-course-image" />
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

        {/* Placeholder static courses */}
        <div className="home-course-card" onClick={() => navigate('/register')}>
          <div className="home-course-image-wrapper">
            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=300&h=180&auto=format&fit=crop" alt="Coding" className="home-course-image" />
            <button className="home-course-favorite">
              <Icon icon="mdi:heart-outline" />
            </button>
          </div>
          <div className="home-course-content">
            <h3 className="home-course-title">Основы программирования на Python</h3>
            <div className="home-course-author">Александр Волков</div>
            <div className="home-course-stats">
              <div className="home-course-rating">
                <Icon icon="mdi:star" className="star-icon" />
                <span>4.9</span>
              </div>
              <div className="home-course-students">
                <Icon icon="mdi:account-outline" />
                <span>15K</span>
              </div>
            </div>
            <div className="home-course-footer">
              <div className="home-course-price">Бесплатно</div>
            </div>
          </div>
        </div>

        <div className="home-course-card" onClick={() => navigate('/register')}>
          <div className="home-course-image-wrapper">
            <img src="https://images.unsplash.com/photo-1541461985943-9550370ad445?q=80&w=300&h=180&auto=format&fit=crop" alt="Design" className="home-course-image" />
            <button className="home-course-favorite">
              <Icon icon="mdi:heart-outline" />
            </button>
          </div>
          <div className="home-course-content">
            <h3 className="home-course-title">Введение в UX/UI дизайн</h3>
            <div className="home-course-author">Елена Соколова</div>
            <div className="home-course-stats">
              <div className="home-course-rating">
                <Icon icon="mdi:star" className="star-icon" />
                <span>4.8</span>
              </div>
              <div className="home-course-students">
                <Icon icon="mdi:account-outline" />
                <span>8.4K</span>
              </div>
            </div>
            <div className="home-course-footer">
              <div className="home-course-price">Бесплатно</div>
            </div>
          </div>
        </div>

        <div className="home-course-card" onClick={() => navigate('/register')}>
          <div className="home-course-image-wrapper">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&h=180&auto=format&fit=crop" alt="Marketing" className="home-course-image" />
            <button className="home-course-favorite">
              <Icon icon="mdi:heart-outline" />
            </button>
          </div>
          <div className="home-course-content">
            <h3 className="home-course-title">Цифровой маркетинг для новичков</h3>
            <div className="home-course-author">Дмитрий Иванов</div>
            <div className="home-course-stats">
              <div className="home-course-rating">
                <Icon icon="mdi:star" className="star-icon" />
                <span>4.7</span>
              </div>
              <div className="home-course-students">
                <Icon icon="mdi:account-outline" />
                <span>12K</span>
              </div>
            </div>
            <div className="home-course-footer">
              <div className="home-course-price">Бесплатно</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default observer(HomeTracks);
