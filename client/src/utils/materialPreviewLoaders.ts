import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Material } from '../models/ICourseDetail';
import {
  classifyMaterialFile,
  ensureFileNameWithExtension,
  getFileExtension,
  getOfficeEmbedUrl,
  resolveMaterialFileUrl,
  toAbsoluteMaterialUrl,
  toPreviewBlob,
} from './materialPreview';

export type MaterialPreviewResult =
  | { variant: 'image'; url: string }
  | { variant: 'video'; url: string }
  | { variant: 'audio'; url: string }
  | { variant: 'pdf'; url: string }
  | { variant: 'text'; text: string }
  | { variant: 'html'; html: string }
  | { variant: 'docviewer'; uri: string; fileName: string }
  | { variant: 'iframe'; src: string };

const MAX_TEXT_BYTES = 5 * 1024 * 1024;

function createBlobUrl(blob: Blob, ext: string): string {
  return URL.createObjectURL(toPreviewBlob(blob, ext));
}

function excelBufferToHtml(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return '<p class="material-preview-empty">Файл не содержит данных.</p>';
  }
  return XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
}

async function tryReadAsText(buffer: ArrayBuffer): Promise<string | null> {
  if (buffer.byteLength > MAX_TEXT_BYTES) return null;
  const sample = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 8000)));
  let control = 0;
  for (let i = 0; i < sample.length; i += 1) {
    if (sample[i] === 0) return null;
    if (sample[i] < 9 || (sample[i] > 13 && sample[i] < 32)) control += 1;
  }
  if (control / sample.length > 0.1) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return null;
  }
}

async function loadPreviewFromBuffer(
  fileName: string,
  fileUrl: string,
  materialType: string | undefined,
  blob: Blob,
  buffer: ArrayBuffer
): Promise<MaterialPreviewResult> {
  const ext = getFileExtension(fileName, fileUrl);
  const variant = classifyMaterialFile(fileName, fileUrl, materialType);

  if (variant === 'html' && ext === 'docx') {
    const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
    return { variant: 'html', html: value };
  }

  if (variant === 'html' && (ext === 'xlsx' || ext === 'xls')) {
    return { variant: 'html', html: excelBufferToHtml(buffer) };
  }

  if (variant === 'iframe') {
    const absolute = toAbsoluteMaterialUrl(fileUrl);
    return { variant: 'iframe', src: getOfficeEmbedUrl(absolute) };
  }

  if (variant === 'image') {
    return { variant: 'image', url: createBlobUrl(blob, ext) };
  }
  if (variant === 'video') {
    return { variant: 'video', url: createBlobUrl(blob, ext) };
  }
  if (variant === 'audio') {
    return { variant: 'audio', url: createBlobUrl(blob, ext) };
  }
  if (variant === 'pdf') {
    return { variant: 'pdf', url: createBlobUrl(blob, ext) };
  }
  if (variant === 'text') {
    const text = await tryReadAsText(buffer);
    if (text !== null) {
      return { variant: 'text', text };
    }
  }

  const asText = await tryReadAsText(buffer);
  if (asText !== null) {
    return { variant: 'text', text: asText };
  }

  return {
    variant: 'docviewer',
    uri: URL.createObjectURL(blob),
    fileName: ensureFileNameWithExtension(fileName, ext),
  };
}

export async function loadMaterialPreview(
  material: Material
): Promise<MaterialPreviewResult> {
  const viewUrl = resolveMaterialFileUrl(material.file_url);
  const fileName = material.title?.trim() || 'material';

  const response = await fetch(viewUrl);
  if (!response.ok) {
    throw new Error('fetch failed');
  }
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();

  return loadPreviewFromBuffer(
    fileName,
    material.file_url,
    material.type,
    blob,
    buffer
  );
}

export async function loadLocalFilePreview(file: File): Promise<MaterialPreviewResult> {
  const buffer = await file.arrayBuffer();
  return loadPreviewFromBuffer(file.name, file.name, 'file', file, buffer);
}
