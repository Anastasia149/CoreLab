import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import {
  TestReview,
  TestReviewQuestion,
  formatTestScoreLabel,
  getCorrectAnswerLabel,
  isReviewOptionCorrect,
  isReviewOptionSelected,
} from '../../utils/testContent';
import '../student/courses/StudentTestPanel.css';
import './TestReviewPanel.css';

type PanelProps = {
  review: TestReview;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

function optionClassName(
  question: TestReviewQuestion,
  optionId: string
): string {
  const isCorrect = isReviewOptionCorrect(question, optionId);
  const wasSelected = isReviewOptionSelected(question, optionId);

  if (wasSelected && isCorrect) {
    return 'student-test-review-option student-test-review-option--correct-selected';
  }
  if (wasSelected && !isCorrect) {
    return 'student-test-review-option student-test-review-option--wrong-selected';
  }
  return 'student-test-review-option';
}

function optionIcon(
  question: TestReviewQuestion,
  optionId: string
): string {
  const isCorrect = isReviewOptionCorrect(question, optionId);
  const wasSelected = isReviewOptionSelected(question, optionId);

  if (wasSelected && isCorrect) return 'mdi:check-circle';
  if (wasSelected) return 'mdi:close-circle';
  return 'mdi:circle-outline';
}

export const TestReviewPanel: React.FC<PanelProps> = ({
  review,
  onClose,
  title = 'Результаты теста',
  subtitle,
}) => {
  return (
    <div className="student-test-panel student-test-review-panel">
      <div className="student-test-panel-header">
        <div>
          <h2 className="student-test-panel-title">{title}</h2>
          {subtitle ? (
            <p className="student-test-review-subtitle">{subtitle}</p>
          ) : null}
          <p className="student-test-review-score">
            {formatTestScoreLabel(review.correctCount, review.totalCount)}
          </p>
        </div>
        <button type="button" className="student-test-cancel" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <ol className="student-test-questions">
        {review.questions.map((q, index) => (
          <li
            key={q.id}
            className={`student-test-question student-test-review-question${
              q.isCorrect
                ? ' student-test-review-question--correct'
                : ' student-test-review-question--wrong'
            }`}
          >
            <div className="student-test-review-question-head">
              <p className="student-test-question-text">
                <span className="student-test-question-num">{index + 1}.</span>
                {q.text}
              </p>
              <span
                className={`student-test-review-badge${
                  q.isCorrect
                    ? ' student-test-review-badge--correct'
                    : ' student-test-review-badge--wrong'
                }`}
              >
                <Icon
                  icon={q.isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'}
                />
                {q.isCorrect ? 'Верно' : 'Неверно'}
              </span>
            </div>

            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt=""
                className="student-test-question-image"
              />
            )}

            <ul className="student-test-options student-test-review-options">
              {q.options.map((option) => (
                <li key={option.id} className={optionClassName(q, option.id)}>
                  <Icon
                    icon={optionIcon(q, option.id)}
                    className="student-test-review-option-icon"
                    aria-hidden
                  />
                  <span>{option.text}</span>
                </li>
              ))}
            </ul>

            {!q.isCorrect && (
              <p className="student-test-correct-answer">
                <strong>Правильный ответ:</strong> {getCorrectAnswerLabel(q)}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

type ModalProps = PanelProps;

export const TestReviewModal: React.FC<ModalProps> = (props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [props.onClose]);

  return createPortal(
    <div
      className="test-review-overlay"
      role="presentation"
      onClick={props.onClose}
    >
      <div
        className="test-review-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <TestReviewPanel {...props} />
      </div>
    </div>,
    document.body
  );
};
