import React from 'react';
import { Icon } from '@iconify/react';

export type CourseRatingSource = {
  average_rating?: number | string | null;
  reviews_count?: number | string | null;
};

/** Средняя оценка для отображения: 5, если отзывов ещё нет. */
export function getCourseDisplayRating(course: CourseRatingSource): number {
  const reviewsCount = Number(course.reviews_count) || 0;
  if (reviewsCount === 0) return 5;

  const avg = Number(course.average_rating);
  if (!Number.isFinite(avg) || avg <= 0) return 5;

  return Math.min(5, Math.max(0, Math.round(avg)));
}

type Props = {
  course: CourseRatingSource;
  className?: string;
};

export const CourseSearchStars: React.FC<Props> = ({ course, className }) => {
  const filled = getCourseDisplayRating(course);
  const reviewsCount = Number(course.reviews_count) || 0;
  const avgLabel =
    reviewsCount > 0
      ? Number(course.average_rating).toFixed(1)
      : '5.0';

  return (
    <div
      className={className}
      aria-label={`Оценка курса ${avgLabel} из 5`}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <Icon
          key={value}
          icon={value <= filled ? 'mdi:star' : 'mdi:star-outline'}
          aria-hidden
        />
      ))}
    </div>
  );
};
