import { useEffect, useState } from 'react';
import { Material } from '../models/ICourseDetail';
import {
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
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let objectUrls: string[] = [];

    setState({ status: 'loading' });

    loadMaterialPreview(material)
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
  }, [material.id, material.file_url, material.title, material.type]);

  return state;
}
