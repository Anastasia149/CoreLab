import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { Context } from '../../index';
import { ICourseReview, ICourseReviewsResponse } from '../../models/ICourseReview';
import Loader from './Loader';
import '../student/courses/StudentCourseDetails.css';

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

interface CourseReviewsPanelProps {
  courseId: number;
  active: boolean;
  /** Только просмотр: сводка и список отзывов без формы оценки */
  readOnly?: boolean;
}

export const CourseReviewsPanel: React.FC<CourseReviewsPanelProps> = observer(
  ({ courseId, active, readOnly = false }) => {
    const { store } = useContext(Context);
    const [reviewsData, setReviewsData] = useState<ICourseReviewsResponse | null>(null);
    const [myReview, setMyReview] = useState<ICourseReview | null>(null);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [selectedRating, setSelectedRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [isSavingReview, setIsSavingReview] = useState(false);
    const [reviewSaveMessage, setReviewSaveMessage] = useState<string | null>(null);

    useEffect(() => {
      if (!active || !courseId) return;

      setRatingLoading(true);
      setReviewSaveMessage(null);

      const load = readOnly
        ? store.getCourseReviews(courseId).then((reviews) => {
            setReviewsData(reviews);
          })
        : Promise.all([
            store.getCourseReviews(courseId),
            store.getMyCourseReview(courseId),
          ]).then(([reviews, mine]) => {
            setReviewsData(reviews);
            setMyReview(mine);
            setSelectedRating(mine?.rating ?? 5);
            setReviewComment(mine?.comment ?? '');
          });

      load.finally(() => setRatingLoading(false));
    }, [active, courseId, readOnly, store]);

    const handleSaveReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!courseId || selectedRating < 1) return;

      setIsSavingReview(true);
      setReviewSaveMessage(null);
      try {
        const saved = await store.saveMyCourseReview(
          courseId,
          selectedRating,
          reviewComment
        );
        if (saved) {
          setMyReview(saved);
          const refreshed = await store.getCourseReviews(courseId);
          if (refreshed) setReviewsData(refreshed);
          setReviewSaveMessage(myReview ? 'Оценка обновлена' : 'Спасибо за отзыв!');
        }
      } catch {
        setReviewSaveMessage('Не удалось сохранить оценку. Попробуйте ещё раз.');
      } finally {
        setIsSavingReview(false);
      }
    };

    if (ratingLoading) {
      return <Loader size="inline" />;
    }

    const summary = reviewsData?.summary;
    const reviewsCount = summary?.reviews_count ?? 0;
    const displayAverage =
      reviewsCount > 0 ? Number(summary?.average_rating ?? 0).toFixed(1) : '5.0';
    const myStudentId = store.user?.id != null ? String(store.user.id) : null;
    const courseReviews = reviewsData?.reviews ?? [];
    const isMyReview = (review: ICourseReview) =>
      myStudentId != null && String(review.student_id) === myStudentId;

    return (
      <div className="student-course-rating">
        <div className="student-course-rating-summary">
          <div className="student-course-rating-average">
            <Icon icon="mdi:star" aria-hidden />
            <span className="student-course-rating-average-value">{displayAverage}</span>
            <span className="student-course-rating-average-label">из 5</span>
          </div>
          <p className="student-course-rating-count">
            {reviewsCount > 0 ? (
              <>
                {reviewsCount}{' '}
                {reviewsCount === 1 ? 'отзыв' : reviewsCount < 5 ? 'отзыва' : 'отзывов'}
              </>
            ) : (
              'Пока нет отзывов · отображается оценка 5 из 5'
            )}
          </p>
        </div>

        {!readOnly && (
          <form className="student-course-rating-form" onSubmit={handleSaveReview}>
            <h3 className="student-course-rating-form-title">
              {myReview ? 'Ваша оценка курса' : 'Оцените этот курс'}
            </h3>
            <p className="student-course-rating-form-hint">
              Поставьте оценку от 1 до 5 звёзд и при желании оставьте комментарий.
            </p>

            <div className="student-course-rating-stars" role="group" aria-label="Оценка курса">
              {RATING_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`student-course-rating-star ${
                    value <= selectedRating ? 'active' : ''
                  }`}
                  onClick={() => setSelectedRating(value)}
                  aria-label={`${value} из 5`}
                  aria-pressed={value <= selectedRating}
                >
                  <Icon icon={value <= selectedRating ? 'mdi:star' : 'mdi:star-outline'} />
                </button>
              ))}
            </div>

            <label className="student-course-rating-comment-label">
              Комментарий
              <textarea
                className="student-course-rating-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Расскажите, что понравилось или что можно улучшить"
                rows={4}
                maxLength={2000}
              />
            </label>

            {reviewSaveMessage && (
              <p className="student-course-rating-message">{reviewSaveMessage}</p>
            )}

            <button
              type="submit"
              className="student-course-rating-submit"
              disabled={selectedRating < 1 || isSavingReview}
            >
              {isSavingReview
                ? 'Сохранение…'
                : myReview
                  ? 'Обновить оценку'
                  : 'Отправить оценку'}
            </button>
          </form>
        )}

        <section className="student-course-reviews-list">
          <h3 className="student-course-reviews-list-title">Оценки и отзывы студентов</h3>
          {courseReviews.length === 0 ? (
            <p className="student-course-reviews-empty">
              {readOnly
                ? 'Пока нет отзывов.'
                : 'Пока никто не оставил оценку. Будьте первым — заполните форму выше.'}
            </p>
          ) : (
            <ul>
              {courseReviews.map((review) => {
                const own = isMyReview(review);
                return (
                  <li
                    key={review.id}
                    className={`student-course-review-card ${own ? 'student-course-review-card--own' : ''}`}
                  >
                    <div className="student-course-review-card-header">
                      <div className="student-course-review-author">
                        {review.student_avatar ? (
                          <img src={review.student_avatar} alt="" />
                        ) : (
                          <span className="student-course-review-author-placeholder" aria-hidden>
                            <Icon icon="solar:user-linear" />
                          </span>
                        )}
                        <span>{own ? 'Вы' : review.student_name}</span>
                        {own && (
                          <span className="student-course-review-own-badge">Ваш отзыв</span>
                        )}
                      </div>
                      <div
                        className="student-course-review-card-stars"
                        aria-label={`Оценка ${review.rating} из 5`}
                      >
                        {RATING_OPTIONS.map((v) => (
                          <Icon
                            key={v}
                            icon={v <= review.rating ? 'mdi:star' : 'mdi:star-outline'}
                            aria-hidden
                          />
                        ))}
                        <span className="student-course-review-rating-value">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.comment ? (
                      <p className="student-course-review-card-text">{review.comment}</p>
                    ) : (
                      <p className="student-course-review-card-text student-course-review-card-text--muted">
                        Без комментария
                      </p>
                    )}
                    <time className="student-course-review-card-date" dateTime={review.updated_at}>
                      {new Date(review.updated_at).toLocaleDateString('ru-RU')}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  }
);
