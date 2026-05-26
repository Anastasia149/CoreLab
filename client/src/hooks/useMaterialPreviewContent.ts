import { useEffect, useState } from 'react';
import { Material } from '../models/ICourseDetail';
import {
  loadLocalFilePreview,
  loadMaterialPreview,
  MaterialPreviewResult,
} from '../utils/materialPreviewLoaders';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; content: MaterialPreviewResult };

function collectRevokeUrls(content: MaterialPreviewResult): string[] {
  switch (content.variant) {
    case 'image':
    case 'video':
    case 'audio':
    case 'pdf':
      return [content.url];
    case 'docviewer':
      return [content.uri];
    default:
      return [];
  }
}

export function useMaterialPreviewContent(material: Material): State {
  return usePreviewContent(material);
}

export function useLocalFilePreviewContent(file: File): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let objectUrls: string[] = [];

    setState({ status: 'loading' });

    loadLocalFilePreview(file)
      .then((content) => {
        const urls = collectRevokeUrls(content);
        if (cancelled) {
          urls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }
        objectUrls = urls;
        setState({ status: 'ready', content });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file.name, file.size, file.lastModified]);

  return state;
}

export function usePreviewContent(material: Material, localFile?: File): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let objectUrls: string[] = [];

    setState({ status: 'loading' });

    const load = localFile
      ? () => loadLocalFilePreview(localFile)
      : () => loadMaterialPreview(material);

    load()
      .then((content) => {
        const urls = collectRevokeUrls(content);
        if (cancelled) {
          urls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }
        objectUrls = urls;
        setState({ status: 'ready', content });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [
    localFile,
    localFile?.name,
    localFile?.size,
    localFile?.lastModified,
    material.id,
    material.file_url,
    material.title,
    material.type,
  ]);

  return state;
}
