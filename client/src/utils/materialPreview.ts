import { Material } from '../models/ICourseDetail';

const DEV_API_ORIGINS = new Set([
  'http://localhost:5000',
  'http://127.0.0.1:5000',
]);

const IMAGE_EXT = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico',
]);
const VIDEO_EXT = new Set(['mp4', 'webm', 'ogg', 'mov', 'm4v']);
const AUDIO_EXT = new Set(['mp3', 'wav', 'm4a', 'aac', 'flac', 'oga']);
const TEXT_EXT = new Set([
  'txt', 'md', 'json', 'xml', 'csv', 'html', 'htm', 'css', 'js', 'ts',
  'tsx', 'jsx', 'log', 'yaml', 'yml', 'sql', 'env', 'ini', 'cfg',
]);
const OFFICE_IFRAME_EXT = new Set([
  'doc', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf',
]);

export type MaterialPreviewVariant =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'text'
  | 'html'
  | 'docviewer'
  | 'iframe';

export function getFileExtension(fileName: string, fileUrl: string): string {
  const fromName = fileName.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (fromName) return fromName;
  const fromUrl = fileUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return fromUrl;
}

/** URL для загрузки через прокси CRA (без перехода на :5000 в браузере). */
export function resolveMaterialFileUrl(fileUrl: string): string {
  const trimmed = fileUrl.trim();
  if (!trimmed || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const origins = new Set(DEV_API_ORIGINS);
    const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');
    if (apiUrl) {
      origins.add(new URL(apiUrl).origin);
    }
    if (origins.has(parsed.origin)) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

export function toAbsoluteMaterialUrl(fileUrl: string): string {
  const resolved = resolveMaterialFileUrl(fileUrl);
  if (resolved.startsWith('http')) {
    return resolved;
  }
  if (typeof window === 'undefined') {
    return resolved;
  }
  return `${window.location.origin}${resolved.startsWith('/') ? '' : '/'}${resolved}`;
}

export function isLocalDevFileUrl(absoluteUrl: string): boolean {
  try {
    const host = new URL(absoluteUrl).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return true;
  }
}

export function getOfficeEmbedUrl(absoluteUrl: string): string {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
}

export function classifyMaterialFile(
  fileName: string,
  fileUrl: string,
  materialType?: string
): MaterialPreviewVariant {
  const ext = getFileExtension(fileName, fileUrl);

  if (materialType === 'image' || IMAGE_EXT.has(ext)) return 'image';
  if (materialType === 'video' || VIDEO_EXT.has(ext)) return 'video';
  if (AUDIO_EXT.has(ext)) return 'audio';
  if (ext === 'pdf') return 'pdf';
  if (TEXT_EXT.has(ext)) return 'text';
  if (ext === 'docx') return 'html';
  if (ext === 'xlsx' || ext === 'xls') return 'html';
  if (OFFICE_IFRAME_EXT.has(ext)) {
    const absolute = toAbsoluteMaterialUrl(fileUrl);
    if (!isLocalDevFileUrl(absolute)) return 'iframe';
    return 'docviewer';
  }
  return 'docviewer';
}

export function getMaterialPreviewMime(ext: string): string {
  if (ext === 'pdf') return 'application/pdf';
  if (VIDEO_EXT.has(ext)) {
    if (ext === 'webm') return 'video/webm';
    if (ext === 'ogg') return 'video/ogg';
    if (ext === 'mov') return 'video/quicktime';
    return 'video/mp4';
  }
  if (AUDIO_EXT.has(ext)) {
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'ogg' || ext === 'oga') return 'audio/ogg';
    if (ext === 'm4a') return 'audio/mp4';
    return 'audio/mpeg';
  }
  if (IMAGE_EXT.has(ext)) {
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'svg') return 'image/svg+xml';
    if (ext === 'bmp') return 'image/bmp';
    return 'image/jpeg';
  }
  return 'application/octet-stream';
}

export function toPreviewBlob(blob: Blob, ext: string): Blob {
  const mime = getMaterialPreviewMime(ext);
  if (blob.type && blob.type !== 'application/octet-stream') {
    return blob;
  }
  return new Blob([blob], { type: mime });
}

export function ensureFileNameWithExtension(fileName: string, ext: string): string {
  if (!ext) return fileName;
  const lower = fileName.toLowerCase();
  if (lower.endsWith(`.${ext}`)) return fileName;
  return `${fileName}.${ext}`;
}

export function getMaterialCardIcon(material: Material): string {
  const ext = getFileExtension(material.title, material.file_url);
  if (IMAGE_EXT.has(ext) || material.type === 'image') return 'mdi:file-image-outline';
  if (VIDEO_EXT.has(ext) || material.type === 'video') return 'mdi:file-video-outline';
  if (AUDIO_EXT.has(ext)) return 'mdi:file-music-outline';
  if (ext === 'pdf') return 'mdi:file-pdf-box';
  if (ext === 'docx' || ext === 'doc' || ext === 'odt') return 'mdi:file-word-outline';
  if (ext === 'xlsx' || ext === 'xls' || ext === 'ods') return 'mdi:file-excel-outline';
  if (ext === 'pptx' || ext === 'ppt' || ext === 'odp') return 'mdi:file-powerpoint-outline';
  if (TEXT_EXT.has(ext)) return 'mdi:file-document-outline';
  return 'mdi:file-outline';
}

/** @deprecated use classifyMaterialFile */
export type MaterialPreviewKind = MaterialPreviewVariant;
export function getMaterialPreviewKind(material: Material): MaterialPreviewKind {
  return classifyMaterialFile(material.title, material.file_url, material.type);
}
