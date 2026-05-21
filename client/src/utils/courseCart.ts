const storageKey = (userId: string | number) => `course-cart-${userId}`;

function normalizeCourseId(id: unknown): number | null {
  const n = typeof id === 'number' ? id : Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeCourseId)
      .filter((id): id is number => id !== null);
  } catch {
    return [];
  }
}

export function loadCartCourseIds(userId: string | number): number[] {
  return parseIds(localStorage.getItem(storageKey(userId)));
}

export function saveCartCourseIds(userId: string | number, ids: number[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(ids));
}

export function isCourseInCart(userId: string | number, courseId: number): boolean {
  const id = normalizeCourseId(courseId);
  if (id === null) return false;
  return loadCartCourseIds(userId).includes(id);
}

export function addCourseToCart(userId: string | number, courseId: number): number[] {
  const id = normalizeCourseId(courseId);
  if (id === null) return loadCartCourseIds(userId);

  const ids = loadCartCourseIds(userId);
  if (ids.includes(id)) return ids;
  const next = [...ids, id];
  saveCartCourseIds(userId, next);
  window.dispatchEvent(new CustomEvent('course-cart-updated', { detail: { userId } }));
  return next;
}

export function removeCourseFromCart(userId: string | number, courseId: number): number[] {
  const id = normalizeCourseId(courseId);
  if (id === null) return loadCartCourseIds(userId);

  const next = loadCartCourseIds(userId).filter((storedId) => storedId !== id);
  saveCartCourseIds(userId, next);
  window.dispatchEvent(new CustomEvent('course-cart-updated', { detail: { userId } }));
  return next;
}
