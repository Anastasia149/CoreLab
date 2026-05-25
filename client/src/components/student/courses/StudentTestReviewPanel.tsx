import React from 'react';
import { Icon } from '@iconify/react';
import {
  TestReview,
  TestReviewQuestion,
  formatTestScoreLabel,
  getCorrectAnswerLabel,
  isReviewOptionCorrect,
  isReviewOptionSelected,
} from '../../../utils/testContent';
import './StudentTestPanel.css';

type Props = {
  review: TestReview;
  onClose: () => void;
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

export const StudentTestReviewPanel: React.FC<Props> = ({ review, onClose }) => {
  return (
    <div className="student-test-panel student-test-review-panel">
      <div className="student-test-panel-header">
        <div>
          <h2 className="student-test-panel-title">Результаты теста</h2>
          <p className="student-test-review-score">
            {formatTestScoreLabel(review.correctCount, review.totalCount)}
          </p>
        </div>
        <button type="button" className="student-test-cancel" onClick={onClose}>
          Вернуться
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
