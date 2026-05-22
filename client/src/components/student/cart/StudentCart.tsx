import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import { loadCartCourseIds, removeCourseFromCart } from '../../../utils/courseCart';
import { formatCoursePriceDisplay } from '../../../utils/coursePrice';
import '../courses/StudentMyCourses.css';
import './StudentCart.css';
import { getCourseCoverUrl } from '../../../constants/courseCover';

const StudentCart: React.FC = () => {
  const { store } = useContext(Context);
  const userId = store.user?.id;

  const [cartIds, setCartIds] = useState<number[]>(() =>
    userId ? loadCartCourseIds(userId) : []
  );

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  useEffect(() => {
    if (!userId) {
      setCartIds([]);
      return;
    }
    setCartIds(loadCartCourseIds(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const onCartUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ userId?: string | number }>).detail;
      if (detail?.userId === undefined || String(detail.userId) === String(userId)) {
        setCartIds(loadCartCourseIds(userId));
      }
    };
    window.addEventListener('course-cart-updated', onCartUpdated);
    return () => window.removeEventListener('course-cart-updated', onCartUpdated);
  }, [userId]);

  const cartCourses = useMemo(
    () => store.courses.filter((course) => cartIds.includes(Number(course.id))),
    [store.courses, cartIds]
  );

  const handleRemove = (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) return;
    setCartIds(removeCourseFromCart(userId, courseId));
  };

  return (
    <div className="student-cart-page">
      <div className="student-cart-content">
        {cartCourses.length > 0 ? (
          <div className="student-courses-grid">
            {cartCourses.map((course) => (
              <Link
                to={`/student/billing?courseId=${course.id}`}
                key={course.id}
                className="student-course-card-link"
              >
                <div className="course-card student-cart-card">
                  <button
                    type="button"
                    className="student-cart-remove"
                    aria-label="Удалить из корзины"
                    onClick={(e) => handleRemove(e, course.id)}
                  >
                    <Icon icon="mdi:close" />
                  </button>
                  <img
                    src={getCourseCoverUrl(course.image_url)}
                    alt={course.title}
                    className="course-card-image"
                  />
                  <div className="course-card-body">
                    <div className="course-card-title">{course.title}</div>
                    <div className="course-card-description">{course.description}</div>
                    <div className="student-cart-price">
                      {formatCoursePriceDisplay(course.price)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="my-courses-empty">
            <Icon icon="streamline-ultimate:shopping-basket-1" className="empty-icon" />
            <h2>Корзина пуста</h2>
            <p>Добавьте платные курсы из раздела «Поиск», чтобы оформить покупку.</p>
            <Link to="/student/search" className="go-to-search-btn">
              Перейти к поиску
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(StudentCart);
