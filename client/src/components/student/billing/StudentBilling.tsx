import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { isCourseInCart } from '../../../utils/courseCart';
import { formatCoursePriceDisplay, parseCoursePrice } from '../../../utils/coursePrice';
import Loader from '../../common/Loader';
import './StudentBilling.css';

const SERVICE_FEE_RATE = 0.03;

const StudentBilling: React.FC = () => {
  const { store } = useContext(Context);
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');
  const courseId = courseIdParam ? Number(courseIdParam) : null;

  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const userId = store.user?.id;

  useEffect(() => {
    store.getAllCourses();
  }, [store]);

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) {
      setLoading(false);
      setCourse(null);
      return;
    }

    const fromList = store.courses.find((c) => Number(c.id) === courseId);
    if (fromList) {
      setCourse(fromList);
      setLoading(false);
      return;
    }

    setLoading(true);
    store.getCourseById(String(courseId)).then((data) => {
      setCourse(data ?? null);
      setLoading(false);
    });
  }, [courseId, store, store.courses]);

  const pricing = useMemo(() => {
    if (!course) return null;
    const subtotal = parseCoursePrice(course.price);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    const total = subtotal + serviceFee;
    return { subtotal, serviceFee, total };
  }, [course]);

  if (!courseId || Number.isNaN(courseId)) {
    return <Navigate to="/student/cart" replace />;
  }

  if (!loading && userId && !isCourseInCart(userId, courseId)) {
    return <Navigate to={`/student/search/${courseId}`} replace />;
  }

  if (loading) {
    return <Loader size="full-page" />;
  }

  if (!course || !pricing) {
    return (
      <div className="student-billing-page">
        <div className="student-billing-empty">
          <h2>Курс не найден</h2>
          <Link to="/student/cart" className="student-billing-back-link">
            Вернуться в корзину
          </Link>
        </div>
      </div>
    );
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    // TODO: интеграция с платёжным провайдером
  };

  return (
    <div className="student-billing-page">
      <div className="student-billing-layout">
        <section className="student-billing-payment">
          <h2 className="student-billing-section-title">Способ оплаты</h2>

          <div className="student-billing-methods">
            <label className={`billing-method-option ${paymentMethod === 'card' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
              />
              <span>Банковская карта</span>
              <span className="billing-method-logos">
                <Icon icon="logos:mastercard" />
                <Icon icon="logos:visa" />
              </span>
            </label>

            {paymentMethod === 'card' && (
              <form className="billing-card-form" onSubmit={handlePay}>
                <label>
                  Имя на карте
                  <input type="text" placeholder="Иван Иванов" autoComplete="cc-name" />
                </label>
                <label>
                  Номер карты
                  <input type="text" placeholder="0000 0000 0000 0000" autoComplete="cc-number" />
                </label>
                <div className="billing-card-row">
                  <label>
                    Срок действия
                    <input type="text" placeholder="ММ/ГГ" autoComplete="cc-exp" />
                  </label>
                  <label>
                    CVC
                    <input type="text" placeholder="000" autoComplete="cc-csc" />
                  </label>
                </div>
              </form>
            )}

            <label className={`billing-method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={() => setPaymentMethod('paypal')}
              />
              <span>Электронный кошелёк</span>
              <Icon icon="logos:paypal" className="billing-paypal-logo" />
            </label>
          </div>
        </section>

        <aside className="student-billing-summary">
          <h2 className="student-billing-section-title">Детали заказа</h2>

          <div className="billing-order-item">
            <div className="billing-order-thumb">
              {course.image_url ? (
                <img src={course.image_url} alt="" />
              ) : (
                <Icon icon="mdi:book-open-page-variant" />
              )}
            </div>
            <div className="billing-order-info">
              <div className="billing-order-title">{course.title}</div>
              <div className="billing-order-meta">{course.author_name || 'Инструктор'}</div>
              <div className="billing-order-price">{formatCoursePriceDisplay(course.price)}</div>
            </div>
          </div>

          <div className="billing-totals">
            <div className="billing-total-row">
              <span>Подытог</span>
              <span>{formatCoursePriceDisplay(pricing.subtotal)}</span>
            </div>
            <div className="billing-total-row">
              <span>Сервисный сбор</span>
              <span>{formatCoursePriceDisplay(pricing.serviceFee)}</span>
            </div>
            <div className="billing-total-row billing-total-row--final">
              <span>Итого</span>
              <span>{formatCoursePriceDisplay(pricing.total)}</span>
            </div>
          </div>

          <label className="billing-terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>Я согласен с условиями использования и политикой конфиденциальности</span>
          </label>

          <button
            type="button"
            className="billing-pay-button"
            disabled={!termsAccepted}
            onClick={handlePay}
          >
            Оплатить
          </button>
        </aside>
      </div>
    </div>
  );
};

export default observer(StudentBilling);
