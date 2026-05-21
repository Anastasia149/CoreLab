import React, { useEffect, useState } from 'react';

const NOT_ASSIGNED = 'not_assigned';
const ASSIGNED = 'assigned';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const LessonDeadlineField: React.FC<Props> = ({ value, onChange }) => {
  const [mode, setMode] = useState(value.trim() ? ASSIGNED : NOT_ASSIGNED);

  useEffect(() => {
    setMode(value.trim() ? ASSIGNED : NOT_ASSIGNED);
  }, [value]);

  const selectNotAssigned = () => {
    setMode(NOT_ASSIGNED);
    onChange('');
  };

  const selectAssigned = () => {
    setMode(ASSIGNED);
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
          className="lesson-deadline-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <p className="form-hint">
        {mode === NOT_ASSIGNED
          ? 'Студенты смогут сдавать работу без ограничения по времени.'
          : 'Если студент сдаст работу после этого времени, она будет отмечена как просроченная.'}
      </p>
    </div>
  );
};
