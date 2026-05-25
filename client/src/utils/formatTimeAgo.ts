export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'только что';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return formatUnit(diffMin, 'минуту', 'минуты', 'минут');
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return formatUnit(diffHour, 'час', 'часа', 'часов');
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return formatUnit(diffDay, 'день', 'дня', 'дней');
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function formatUnit(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  let word = many;
  if (mod10 === 1 && mod100 !== 11) word = one;
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = few;
  return `${n} ${word} назад`;
}
