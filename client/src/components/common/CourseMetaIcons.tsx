import React from 'react';
import { Icon } from '@iconify/react';
import './CourseMetaIcons.css';

export interface CourseMetaIconsProps {
  authorName?: string | null;
  lessonsCount: number;
  studentsCount: number;
  /** `compact` — одна строка для карточки в «Мои курсы» */
  variant?: 'default' | 'compact';
  /** Не показывать блок «Уроков» (например, на странице одного урока) */
  omitLessons?: boolean;
}

const CourseMetaIcons: React.FC<CourseMetaIconsProps> = ({
  authorName,
  lessonsCount,
  studentsCount,
  variant = 'default',
  omitLessons = false,
}) => {
  const rootClass =
    variant === 'compact'
      ? 'course-meta-icons course-meta-icons--compact'
      : 'course-meta-icons';

  return (
    <div className={rootClass} role="group" aria-label="Кратко о курсе">
      <div className="course-meta-item" title="Автор курса">
        <Icon icon="mdi:account-circle-outline" className="course-meta-item-icon" aria-hidden />
        <span className="course-meta-item-label">Автор</span>
        <span className="course-meta-item-value">{authorName?.trim() || '—'}</span>
      </div>
      {!omitLessons && (
      <div className="course-meta-item" title="Всего уроков">
        <Icon icon="mdi:play-circle-outline" className="course-meta-item-icon" aria-hidden />
        <span className="course-meta-item-label">Уроков</span>
        <span className="course-meta-item-value">{lessonsCount}</span>
      </div>
      )}
      <div className="course-meta-item" title="Студентов на курсе">
        <Icon icon="mdi:account-group-outline" className="course-meta-item-icon" aria-hidden />
        <span className="course-meta-item-label">Студентов</span>
        <span className="course-meta-item-value">{studentsCount}</span>
      </div>
    </div>
  );
};

export default CourseMetaIcons;
