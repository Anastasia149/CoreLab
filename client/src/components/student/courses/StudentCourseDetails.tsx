import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Icon } from '@iconify/react';
import './StudentCourseDetails.css';
import { ISearchDetails, Lesson } from '../../../models/ICourseDetail';
import { ICourseReview, ICourseReviewsResponse } from '../../../models/ICourseReview';
import Loader from '../../common/Loader';
import CourseMetaIcons from '../../common/CourseMetaIcons';
import { getCourseCoverUrl } from '../../../constants/courseCover';

type CourseTab = 'lessons' | 'rating';

const RATING_OPTIONS = [1, 2, 3, 4, 5] as const;

function countLessonsInCourse(course: ISearchDetails): number {
  if (course.lessons_count != null && course.lessons_count >= 0) {
    return Number(course.lessons_count);
  }
  const fromModules = (course.modules || []).reduce(
    (n, m) => n + (m.lessons?.length || 0),
    0
  );
  const standalone = (course.lessons || []).length;
  return fromModules + standalone;
}

const moduleOpenKey = (moduleId: number) => `m-${moduleId}`;
const STANDALONE_LESSONS_KEY = 'lessons-standalone';

function CurriculumLessonRow(props: { lesson: Lesson; onNavigate: () => void }) {
  const { lesson, onNavigate } = props;
  return (
    <div className="curriculum-lesson" onClick={onNavigate}>
      <div className="lesson-left">
        {lesson.image_url ? (
          <span className="curriculum-lesson-thumb">
            <img src={lesson.image_url} alt="" />
          </span>
        ) : (
          <span className="curriculum-lesson-thumb curriculum-lesson-thumb--placeholder" aria-hidden>
            <Icon icon="mdi:book-open-outline" />
          </span>
        )}
        <span className="curriculum-lesson-title">{lesson.title}</span>
      </div>
    </div>
  );
}

const StudentCourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [course, setCourse] = useState<ISearchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CourseTab>('lessons');
  const [reviewsData, setReviewsData] = useState<ICourseReviewsResponse | null>(null);
  const [myReview, setMyReview] = useState<ICourseReview | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSaveMessage, setReviewSaveMessage] = useState<string | null>(null);
  const [openModuleKeys, setOpenModuleKeys] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!id) {
      navigate('/student/my-courses', { replace: true });
      return;
    }

    const courseId = Number(id);
    store.getCourseDetails(courseId).then(data => {
      if (data) {
        setCourse(data);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    }).finally(() => {
      setLoading(false);
    });
  }, [id, navigate, store]);

  useEffect(() => {
    if (!course) return;
    const keys = new Set<string>();
    (course.modules || []).forEach((m) => keys.add(moduleOpenKey(m.id)));
    if (course.lessons?.length) {
      keys.add(STANDALONE_LESSONS_KEY);
    }
    setOpenModuleKeys(keys);
    // Intentionally only when navigating to another course — keep user toggles on refetch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  useEffect(() => {
    if (activeTab !== 'rating' || !id) return;

    const courseId = Number(id);
    setRatingLoading(true);
    setReviewSaveMessage(null);

    Promise.all([
      store.getCourseReviews(courseId),
      store.getMyCourseReview(courseId),
    ])
      .then(([reviews, mine]) => {
        setReviewsData(reviews);
        setMyReview(mine);
        setSelectedRating(mine?.rating ?? 5);
        setReviewComment(mine?.comment ?? '');
      })
      .finally(() => setRatingLoading(false));
  }, [activeTab, id, store]);

  const toggleModuleOpen = useCallback((key: string) => {
    setOpenModuleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  if (loading) {
    return <Loader size="full-page" />;
  }

  if (!course) {
    return <div className="student-course-details-empty">Курс не найден</div>;
  }

  const hasModules = course.modules?.length > 0;
  const hasStandaloneLessons = course.lessons?.length > 0;

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || selectedRating < 1) return;

    setIsSavingReview(true);
    setReviewSaveMessage(null);
    try {
      const saved = await store.saveMyCourseReview(
        Number(id),
        selectedRating,
        reviewComment
      );
      if (saved) {
        setMyReview(saved);
        const refreshed = await store.getCourseReviews(Number(id));
        if (refreshed) setReviewsData(refreshed);
        setReviewSaveMessage(myReview ? 'Оценка обновлена' : 'Спасибо за отзыв!');
      }
    } catch {
      setReviewSaveMessage('Не удалось сохранить оценку. Попробуйте ещё раз.');
    } finally {
      setIsSavingReview(false);
    }
  };

  const renderCurriculum = () => (
    <div className="student-course-curriculum">
      {hasModules ? (
        course.modules.map((module) => {
          const key = moduleOpenKey(module.id);
          const isOpen = openModuleKeys.has(key);
          return (
            <div
              className={`curriculum-module ${isOpen ? 'curriculum-module--open' : 'curriculum-module--closed'}`}
              key={module.id}
            >
              <button
                type="button"
                className="curriculum-module-header"
                onClick={() => toggleModuleOpen(key)}
                aria-expanded={isOpen}
              >
                <Icon icon="mdi:chevron-down" className="curriculum-module-chevron" aria-hidden />
                <span className="curriculum-module-heading">{module.title}</span>
              </button>
              {isOpen && (
                <div className="curriculum-lessons">
                  {module.lessons.length > 0 ? (
                    module.lessons.map((lesson) => (
                      <CurriculumLessonRow
                        key={lesson.id}
                        lesson={lesson}
                        onNavigate={() => navigate(`/student/lesson/${lesson.id}`)}
                      />
                    ))
                  ) : (
                    <div className="curriculum-empty">
                      В этом модуле пока нет лекций, заданий и тестов
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : null}

      {hasStandaloneLessons && (
        <div
          className={`curriculum-module ${
            openModuleKeys.has(STANDALONE_LESSONS_KEY)
              ? 'curriculum-module--open'
              : 'curriculum-module--closed'
          }`}
        >
          <button
            type="button"
            className="curriculum-module-header"
            onClick={() => toggleModuleOpen(STANDALONE_LESSONS_KEY)}
            aria-expanded={openModuleKeys.has(STANDALONE_LESSONS_KEY)}
          >
            <Icon icon="mdi:chevron-down" className="curriculum-module-chevron" aria-hidden />
            <span className="curriculum-module-heading">Лекции, задания и тесты</span>
          </button>
          {openModuleKeys.has(STANDALONE_LESSONS_KEY) && (
            <div className="curriculum-lessons">
              {course.lessons.map((lesson) => (
                <CurriculumLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onNavigate={() => navigate(`/student/lesson/${lesson.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!hasModules && !hasStandaloneLessons && (
        <div className="course-details-empty">
          В этом курсе пока нет модулей или лекций, заданий и тестов
        </div>
      )}
    </div>
  );

  const renderCourseRating = () => {
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

        <section className="student-course-reviews-list">
          <h3 className="student-course-reviews-list-title">Оценки и отзывы студентов</h3>
          {courseReviews.length === 0 ? (
            <p className="student-course-reviews-empty">
              Пока никто не оставил оценку. Будьте первым — заполните форму выше.
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
  };

  return (
    <div className="student-course-details-page">
      <div className="student-course-details-main">
        <div className="student-course-panel">
          <div className="student-course-hero">
            <div className="student-course-cover-wrap">
              <img
                src={getCourseCoverUrl(course.image_url)}
                alt={course.title}
                className="student-course-cover"
              />
            </div>
            <div className="student-course-hero-text">
              <h1>{course.title}</h1>
              <p className="student-course-description">{course.description}</p>
              <div className="student-course-hero-meta">
                <CourseMetaIcons
                  variant="compact"
                  authorName={course.author_name}
                  lessonsCount={countLessonsInCourse(course)}
                  studentsCount={Number(course.students_count) || 0}
                  onAuthorClick={() =>
                    navigate(`/student/my-courses/${id}/instructor`)
                  }
                />
              </div>
            </div>
          </div>

          <div className="student-course-tabs" role="tablist" aria-label="Разделы курса">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'lessons'}
              className={`student-course-tab ${activeTab === 'lessons' ? 'active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Уроки
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'rating'}
              className={`student-course-tab ${activeTab === 'rating' ? 'active' : ''}`}
              onClick={() => setActiveTab('rating')}
            >
              Оценка курса
            </button>
          </div>

          <div
            className="student-course-tab-panel"
            role="tabpanel"
            hidden={activeTab !== 'lessons'}
          >
            {activeTab === 'lessons' && renderCurriculum()}
          </div>
          <div
            className="student-course-tab-panel"
            role="tabpanel"
            hidden={activeTab !== 'rating'}
          >
            {activeTab === 'rating' && renderCourseRating()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(StudentCourseDetails);
