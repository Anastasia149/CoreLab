import React, { useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import { ICourse } from '../../../models/ICourse';
import { isCourseInCart, removeCourseFromCart } from '../../../utils/courseCart';
import { formatCoursePriceDisplay, parseCoursePrice } from '../../../utils/coursePrice';
import Loader from '../../common/Loader';
import './StudentBilling.css';
import { getCourseCoverUrl } from '../../../constants/courseCover';
import {
  formatCardNumberInput,
  formatCvcInput,
  formatExpiryInput,
  validateCardPayment,
  type CardPaymentErrors,
} from '../../../utils/cardPayment';

const SERVICE_FEE_RATE = 0.03;

const StudentBilling: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId');
  const courseId = courseIdParam ? Number(courseIdParam) : null;

  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardErrors, setCardErrors] = useState<CardPaymentErrors>({});
  const [showCardErrors, setShowCardErrors] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const userId = store.user?.id;

  const isEnrolled =
    store.user?.courses?.some((c) => Number(c.id) === courseId) ?? false;

  const cardFields = { cardName, cardNumber, expiry, cvc };

  useEffect(() => {
    if (!showCardErrors) return;
    setCardErrors(validateCardPayment(cardFields));
  }, [cardName, cardNumber, expiry, cvc, showCardErrors]);

  const handlePay = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!termsAccepted || !courseId || paying) return;

    const errors = validateCardPayment(cardFields);
    setCardErrors(errors);
    setShowCardErrors(true);
    if (Object.keys(errors).length > 0) return;

    setPaying(true);
    setPaymentError(null);

    try {
      if (!isEnrolled) {
        await store.enrollCourse(courseId);
      }
      navigate(`/student/my-courses/${courseId}`, { replace: true });
      if (userId) {
        removeCourseFromCart(userId, courseId);
      }
    } catch {
      setPaymentError('Не удалось оформить покупку. Попробуйте ещё раз.');
    } finally {
      setPaying(false);
    }
  };

  const fieldError = (field: keyof CardPaymentErrors) =>
    showCardErrors ? cardErrors[field] : undefined;

  const inputClass = (field: keyof CardPaymentErrors) =>
    fieldError(field) ? 'billing-input--error' : '';

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
    if (isEnrolled) {
      return <Navigate to={`/student/my-courses/${courseId}`} replace />;
    }
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

  return (
    <div className="student-billing-page">
      <div className="student-billing-layout">
        <section className="student-billing-payment">
          <h2 className="student-billing-section-title">Способ оплаты</h2>

          <div className="student-billing-methods">
            <div className="billing-method-option active">
              <span>Банковская карта</span>
              <span className="billing-method-logos">
                <Icon icon="logos:mastercard" />
                <Icon icon="logos:visa" />
              </span>
            </div>

            <form
              id="billing-card-form"
              className="billing-card-form"
              onSubmit={handlePay}
              noValidate
            >
              <label>
                Имя на карте
                <input
                  type="text"
                  className={inputClass('cardName')}
                  placeholder="Иван Иванов"
                  autoComplete="cc-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength={50}
                />
                {fieldError('cardName') && (
                  <p className="billing-field-error">{fieldError('cardName')}</p>
                )}
              </label>
              <label>
                Номер карты
                <input
                  type="text"
                  className={inputClass('cardNumber')}
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                  maxLength={19}
                />
                {fieldError('cardNumber') && (
                  <p className="billing-field-error">{fieldError('cardNumber')}</p>
                )}
              </label>
              <div className="billing-card-row">
                <label>
                  Срок действия
                  <input
                    type="text"
                    className={inputClass('expiry')}
                    placeholder="ММ/ГГ"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                    maxLength={5}
                  />
                  {fieldError('expiry') && (
                    <p className="billing-field-error">{fieldError('expiry')}</p>
                  )}
                </label>
                <label>
                  CVC
                  <input
                    type="text"
                    className={inputClass('cvc')}
                    placeholder="000"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    value={cvc}
                    onChange={(e) => setCvc(formatCvcInput(e.target.value))}
                    maxLength={3}
                  />
                  {fieldError('cvc') && (
                    <p className="billing-field-error">{fieldError('cvc')}</p>
                  )}
                </label>
              </div>
            </form>
          </div>
        </section>

        <aside className="student-billing-summary">
          <h2 className="student-billing-section-title">Детали заказа</h2>

          <div className="billing-order-item">
            <div className="billing-order-thumb">
              <img src={getCourseCoverUrl(course.image_url)} alt="" />
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

          {paymentError && (
            <p className="billing-field-error billing-payment-error" role="alert">
              {paymentError}
            </p>
          )}

          <button
            type="submit"
            form="billing-card-form"
            className="billing-pay-button"
            disabled={!termsAccepted || paying}
          >
            {paying ? 'Оплата…' : 'Оплатить'}
          </button>
        </aside>
      </div>
    </div>
  );
};

export default observer(StudentBilling);
