import React from 'react';
import { Icon } from '@iconify/react';

export type CourseRatingSource = {
  average_rating?: number | string | null;
  reviews_count?: number | string | null;
};

export function getCourseReviewsCount(course: CourseRatingSource): number {
  return Number(course.reviews_count) || 0;
}

export function courseHasReviews(course: CourseRatingSource): boolean {
  return getCourseReviewsCount(course) > 0;
}

/** Средняя оценка в звёздах (1–5), только если есть отзывы. */
export function getCourseDisplayRating(course: CourseRatingSource): number {
  if (!courseHasReviews(course)) return 0;

  const avg = Number(course.average_rating);
  if (!Number.isFinite(avg) || avg <= 0) return 0;

  return Math.min(5, Math.max(1, Math.round(avg)));
}

type Props = {
  course: CourseRatingSource;
  className?: string;
};

export const CourseSearchStars: React.FC<Props> = ({ course, className }) => {
  const reviewsCount = getCourseReviewsCount(course);
  const hasReviews = reviewsCount > 0;
  const filled = hasReviews ? getCourseDisplayRating(course) : 0;
  const avgLabel = hasReviews
    ? Number(course.average_rating).toFixed(1)
    : 'нет оценок';

  const rootClass = [className, !hasReviews ? 'course-stars--unrated' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} aria-label={`Оценка курса: ${avgLabel} из 5`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const showFilled = hasReviews && value <= filled;
        return (
          <Icon
            key={value}
            icon={!hasReviews || showFilled ? 'mdi:star' : 'mdi:star-outline'}
            className={!hasReviews ? 'course-star--muted' : undefined}
            aria-hidden
          />
        );
      })}
    </div>
  );
};
