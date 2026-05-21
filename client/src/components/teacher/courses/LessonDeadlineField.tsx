import React, { useEffect, useState } from 'react';
import {
  getMinDatetimeLocalValue,
  isDeadlineLocalInPast,
} from '../../../utils/lessonDeadline';

const NOT_ASSIGNED = 'not_assigned';
const ASSIGNED = 'assigned';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const LessonDeadlineField: React.FC<Props> = ({ value, onChange }) => {
  const [mode, setMode] = useState(value.trim() ? ASSIGNED : NOT_ASSIGNED);
  const [error, setError] = useState('');
  const minDatetime = getMinDatetimeLocalValue();

  useEffect(() => {
    setMode(value.trim() ? ASSIGNED : NOT_ASSIGNED);
    if (!value.trim() || !isDeadlineLocalInPast(value)) {
      setError('');
    }
  }, [value]);

  const selectNotAssigned = () => {
    setMode(NOT_ASSIGNED);
    setError('');
    onChange('');
  };

  const selectAssigned = () => {
    setMode(ASSIGNED);
  };

  const handleDatetimeChange = (next: string) => {
    onChange(next);
    if (next && isDeadlineLocalInPast(next)) {
      setError('Срок сдачи не может быть раньше текущего времени.');
    } else {
      setError('');
    }
  };

  return (
    <div className="form-group full-width lesson-deadline-field">
      <span className="lesson-deadline-field-label">Срок сдачи</span>
      <div className="lesson-deadline-options">
        <label className={`lesson-deadline-option${mode === NOT_ASSIGNED ? ' active' : ''}`}>
          <input
            type="radio"
            name="lesson-deadline-mode"
            checked={mode === NOT_ASSIGNED}
            onChange={selectNotAssigned}
          />
          Срок не назначен
        </label>
        <label className={`lesson-deadline-option${mode === ASSIGNED ? ' active' : ''}`}>
          <input
            type="radio"
            name="lesson-deadline-mode"
            checked={mode === ASSIGNED}
            onChange={selectAssigned}
          />
          Указать срок
        </label>
      </div>
      {mode === ASSIGNED && (
        <input
          type="datetime-local"
          id="lesson-deadline"
          className={`lesson-deadline-input${error ? ' lesson-deadline-input--error' : ''}`}
          value={value}
          min={minDatetime}
          onChange={(e) => handleDatetimeChange(e.target.value)}
        />
      )}
      {error && <p className="lesson-deadline-error">{error}</p>}
      <p className="form-hint">
        {mode === NOT_ASSIGNED
          ? 'Студенты смогут сдавать работу без ограничения по времени.'
          : 'Срок должен быть не раньше текущего времени. Просроченные сдачи будут отмечены отдельно.'}
      </p>
    </div>
  );
};
