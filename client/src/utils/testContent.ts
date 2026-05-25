export type TestOption = {
  id: string;
  text: string;
  isCorrect?: boolean;
};

export type TestQuestion = {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: TestOption[];
  isRequired: boolean;
  imageUrl: string | null;
};

export type TestSubmissionResult = {
  correctCount: number;
  totalCount: number;
  answers?: Record<string, string[]>;
};

export function parseTestQuestions(content: string | null | undefined): TestQuestion[] {
  if (!content?.trim()) return [];
  try {
    const parsed = JSON.parse(content) as TestQuestion[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((q) => ({
      id: String(q.id),
      text: q.text || '',
      type: q.type === 'multiple' ? 'multiple' : 'single',
      options: (q.options || []).map((o) => ({
        id: String(o.id),
        text: o.text || '',
        isCorrect: o.isCorrect,
      })),
      isRequired: q.isRequired !== false,
      imageUrl: q.imageUrl || null,
    }));
  } catch {
    return [];
  }
}

export function parseTestSubmission(
  content: string | null | undefined
): TestSubmissionResult | null {
  if (!content?.trim() || !content.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(content) as {
      kind?: string;
      correctCount?: number;
      totalCount?: number;
      answers?: Record<string, string[]>;
    };
    if (parsed.kind !== 'test') return null;
    const correctCount = Number(parsed.correctCount);
    const totalCount = Number(parsed.totalCount);
    if (Number.isNaN(correctCount) || Number.isNaN(totalCount)) return null;
    return {
      correctCount,
      totalCount,
      answers: parsed.answers,
    };
  } catch {
    return null;
  }
}

export function isTestSubmissionType(type: string | null | undefined): boolean {
  return type === 'test';
}

export function formatTestScoreLabel(correct: number, total: number): string {
  return `${correct} из ${total} правильных`;
}

export type TestReviewOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  wasSelected: boolean;
};

export type TestReviewQuestion = {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  imageUrl: string | null;
  isCorrect: boolean;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  options: TestReviewOption[];
};

export type TestReview = {
  correctCount: number;
  totalCount: number;
  questions: TestReviewQuestion[];
};

export function isReviewOptionCorrect(
  question: TestReviewQuestion,
  optionId: string
): boolean {
  const id = String(optionId);
  return (
    question.correctOptionIds.includes(id) ||
    question.options.some((o) => String(o.id) === id && o.isCorrect)
  );
}

export function isReviewOptionSelected(
  question: TestReviewQuestion,
  optionId: string
): boolean {
  const id = String(optionId);
  return (
    question.selectedOptionIds.includes(id) ||
    question.options.some((o) => String(o.id) === id && o.wasSelected)
  );
}

export function getCorrectAnswerLabel(question: TestReviewQuestion): string {
  const labels = question.options
    .filter((o) => isReviewOptionCorrect(question, o.id))
    .map((o) => o.text)
    .filter(Boolean);
  return labels.length > 0 ? labels.join(', ') : '—';
}
