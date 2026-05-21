import React from 'react';
import {
  parseSubmissionItems,
  isSubmissionCompletedOnly,
} from '../../../utils/submissionContent';
import {
  parseTestSubmission,
  formatTestScoreLabel,
  isTestSubmissionType,
} from '../../../utils/testContent';
import { SubmissionMaterialList } from '../../common/SubmissionMaterialList';

export type LessonSubmissionRow = {
  id: number;
  student_id?: number;
  student_name?: string | null;
  type: string;
  content?: string | null;
  created_at: string;
  review_status?: string | null;
  is_overdue?: boolean;
};

export function TeacherSubmissionMaterial({ s }: { s: LessonSubmissionRow }) {
  if (isTestSubmissionType(s.type)) {
    const result = parseTestSubmission(s.content);
    return (
      <SubmissionMaterialBlock>
        <p className="submission-material-text">
          {result
            ? `Результат теста: ${formatTestScoreLabel(result.correctCount, result.totalCount)}`
            : 'Тест отправлен (результат недоступен).'}
        </p>
      </SubmissionMaterialBlock>
    );
  }

  const items = parseSubmissionItems(s);

  if (isSubmissionCompletedOnly(s)) {
    return (
      <SubmissionMaterialBlock>
        <p className="submission-material-text">
          Ученик отметил задание как выполненное (без ссылки и файла).
        </p>
      </SubmissionMaterialBlock>
    );
  }

  if (items.length > 0) {
    return (
      <SubmissionMaterialBlock>
        <SubmissionMaterialList items={items} />
      </SubmissionMaterialBlock>
    );
  }

  return (
    <SubmissionMaterialBlock>
      <p className="submission-material-text muted">Нет данных для отображения.</p>
    </SubmissionMaterialBlock>
  );
}

function SubmissionMaterialBlock({ children }: { children: React.ReactNode }) {
  return <div className="submission-material-block">{children}</div>;
}
