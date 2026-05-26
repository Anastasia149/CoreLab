import { Material } from '../models/ICourseDetail';

export type SubmissionItem = {
  type: 'link' | 'file';
  content: string;
  label?: string;
};

export type SubmissionLike = {
  type: string;
  content?: string | null;
};

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const segment = path.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : url;
  } catch {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  }
}

export function parseSubmissionItems(submission: SubmissionLike): SubmissionItem[] {
  const content = (submission.content || '').trim();
  if (!content) return [];

  if (content.startsWith('{')) {
    try {
      const parsed = JSON.parse(content) as { items?: SubmissionItem[] };
      if (Array.isArray(parsed.items)) {
        return parsed.items
          .filter(
            (item) =>
              item &&
              (item.type === 'link' || item.type === 'file') &&
              typeof item.content === 'string' &&
              item.content.trim()
          )
          .map((item) => ({
            type: item.type,
            content: item.content.trim(),
            label: item.label?.trim() || undefined,
          }));
      }
    } catch {
      /* legacy plain content */
    }
  }

  if (submission.type === 'link' || submission.type === 'file') {
    return [
      {
        type: submission.type,
        content,
        label:
          submission.type === 'file'
            ? fileNameFromUrl(content)
            : content,
      },
    ];
  }

  return [];
}

export function isSubmissionCompletedOnly(submission: SubmissionLike): boolean {
  return submission.type === 'completed' && parseSubmissionItems(submission).length === 0;
}

export function submissionItemLabel(item: SubmissionItem): string {
  if (item.label?.trim()) return item.label.trim();
  return item.content;
}

export function submissionFileToMaterial(item: SubmissionItem, index: number): Material {
  return {
    id: -(index + 1),
    type: 'file',
    title: submissionItemLabel(item),
    file_url: item.content,
  };
}
