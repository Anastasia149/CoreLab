import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { TestQuestion } from '../../../utils/testContent';
import { useAppModal } from '../../../context/AppModalContext';
import './StudentTestPanel.css';

type Props = {
  questions: TestQuestion[];
  onSubmit: (answers: Record<string, string[]>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
};

export const StudentTestPanel: React.FC<Props> = ({
  questions,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { showAlert } = useAppModal();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const toggleOption = (question: TestQuestion, optionId: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.type === 'single') {
        return { ...prev, [question.id]: checked ? [optionId] : [] };
      }
      if (checked) {
        return { ...prev, [question.id]: [...current, optionId] };
      }
      return {
        ...prev,
        [question.id]: current.filter((id) => id !== optionId),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const q of questions) {
      if (q.isRequired && !(answers[q.id]?.length > 0)) {
        await showAlert('Ответьте на все обязательные вопросы.');
        return;
      }
    }
    await onSubmit(answers);
  };

  if (questions.length === 0) {
    return (
      <p className="student-test-empty">Тест пока не содержит вопросов.</p>
    );
  }

  return (
    <form className="student-test-panel" onSubmit={handleSubmit}>
      <div className="student-test-panel-header">
        <h2 className="student-test-panel-title">Решение теста</h2>
        <button
          type="button"
          className="student-test-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Вернуться
        </button>
      </div>

      <ol className="student-test-questions">
        {questions.map((q, index) => (
          <li key={q.id} className="student-test-question">
            <p className="student-test-question-text">
              <span className="student-test-question-num">{index + 1}.</span>
              {q.text}
              {q.isRequired && (
                <span className="student-test-required" aria-hidden>
                  *
                </span>
              )}
            </p>
            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt=""
                className="student-test-question-image"
              />
            )}
            <ul className="student-test-options">
              {q.options.map((option) => {
                const selected = (answers[q.id] || []).includes(option.id);
                return (
                  <li key={option.id}>
                    <label className={`student-test-option${selected ? ' selected' : ''}`}>
                      <input
                        type={q.type === 'single' ? 'radio' : 'checkbox'}
                        name={`question-${q.id}`}
                        checked={selected}
                        onChange={(e) =>
                          toggleOption(q, option.id, e.target.checked)
                        }
                      />
                      <span>{option.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <button type="submit" className="submit-btn student-test-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : 'Отправить'}
      </button>
    </form>
  );
};
