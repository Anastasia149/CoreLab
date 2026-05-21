import React from 'react';
import { Icon } from '@iconify/react';
import './LessonDeadlineInfo.css';
import {
  getDeadlineStatusText,
  getTeacherDeadlineStatusText,
  lessonTypeHasDeadline,
} from '../../utils/lessonDeadline';

type Props = {
  deadline?: string | null;
  lessonType: string;
  audience?: 'student' | 'teacher';
  className?: string;
};

export const LessonDeadlineInfo: React.FC<Props> = ({
  deadline,
  lessonType,
  audience = 'student',
  className = '',
}) => {
  if (!lessonTypeHasDeadline(lessonType)) return null;

  const text =
    audience === 'teacher'
      ? getTeacherDeadlineStatusText(deadline)
      : getDeadlineStatusText(deadline);
  const unset = !deadline;

  return (
    <p
      className={`lesson-deadline-info${unset ? ' lesson-deadline-info--unset' : ''}${className ? ` ${className}` : ''}`}
    >
      {audience === 'teacher' && (
        <Icon
          icon={unset ? 'mdi:clock-outline' : 'mdi:clock-alert-outline'}
          className="lesson-deadline-info-icon"
        />
      )}
      <span>{text}</span>
    </p>
  );
};
