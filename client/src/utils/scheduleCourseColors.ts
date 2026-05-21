const COURSE_COLORS = [
  '#7b5cff',
  '#22c55e',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
  '#6366f1',
];

export function getCourseColor(courseId: number): string {
  return COURSE_COLORS[Math.abs(courseId) % COURSE_COLORS.length];
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

/** Светлый фон карточки события */
export function getCourseColorTint(hex: string, alpha = 0.14): string {
  const rgb = parseHex(hex);
  if (!rgb) return 'rgba(123, 92, 255, 0.14)';
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
