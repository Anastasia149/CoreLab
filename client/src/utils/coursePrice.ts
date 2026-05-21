export const COURSE_PRICE_UNIT = 'Б';

export function formatCoursePriceDisplay(
  price: number | string | null | undefined,
  freeLabel = 'Бесплатно'
): string {
  const n =
    price == null || price === ''
      ? 0
      : typeof price === 'string'
        ? parseFloat(price)
        : price;
  if (Number.isNaN(n) || n <= 0) return freeLabel;
  return `${n.toLocaleString('ru-RU')} ${COURSE_PRICE_UNIT}`;
}

export function parseCoursePrice(value: number | string | null | undefined): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

export function isPaidCoursePrice(price: number | string | null | undefined): boolean {
  return parseCoursePrice(price) > 0;
}

export function validateCoursePrice(value: number | string): string | null {
  if (value === '' || value === null || value === undefined) return null;

  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) {
    return 'Укажите корректную цену.';
  }
  if (n < 0) {
    return 'Цена не может быть отрицательной.';
  }
  return null;
}
