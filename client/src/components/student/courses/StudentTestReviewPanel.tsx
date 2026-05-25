import React from 'react';
import { TestReview } from '../../../utils/testContent';
import { TestReviewPanel } from '../../common/TestReviewPanel';

type Props = {
  review: TestReview;
  onClose: () => void;
};

export const StudentTestReviewPanel: React.FC<Props> = ({ review, onClose }) => (
  <TestReviewPanel review={review} onClose={onClose} title="Результаты теста" />
);
