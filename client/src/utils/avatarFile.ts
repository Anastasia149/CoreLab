import { AVATAR_MAX_BYTES, formatFileSize, getFileSizeError } from '../constants/fileLimits';

const MIME_JPEG = 'image/jpeg';
const MIME_PNG = 'image/png';

export { AVATAR_MAX_BYTES };

/** Сообщение об ошибке или null, если файл подходит под JPG/PNG */
export function getAvatarFileTypeError(file: File): string | null {
  const mime = (file.type || '').toLowerCase().trim();
  if (mime === MIME_JPEG || mime === MIME_PNG) {
    return null;
  }
  if (mime === 'image/jpg') {
    return null;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!mime && (ext === 'jpg' || ext === 'jpeg' || ext === 'png')) {
    return null;
  }
  return 'Допустимы только файлы JPG или PNG.';
}

export function getAvatarFileSizeError(file: File): string | null {
  return getFileSizeError(file, AVATAR_MAX_BYTES, 'Фото');
}

/** Тип, размер или null — файл подходит для аватара */
export function getAvatarFileError(file: File): string | null {
  return getAvatarFileTypeError(file) ?? getAvatarFileSizeError(file);
}

export function getAvatarMaxSizeLabel(): string {
  return formatFileSize(AVATAR_MAX_BYTES);
}
