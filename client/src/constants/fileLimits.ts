export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const ASSIGNMENT_FILE_MAX_BYTES = 25 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} КБ`;
  }
  const mb = bytes / (1024 * 1024);
  const rounded = Math.round(mb * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} МБ` : `${rounded.toString().replace('.', ',')} МБ`;
}

export function getFileSizeError(
  file: File,
  maxBytes: number,
  label = 'Файл'
): string | null {
  if (file.size <= maxBytes) return null;
  return `${label} слишком большой. Максимальный размер — ${formatFileSize(maxBytes)}.`;
}

export function getAssignmentFileSizeError(file: File): string | null {
  return getFileSizeError(file, ASSIGNMENT_FILE_MAX_BYTES, 'Файл');
}
