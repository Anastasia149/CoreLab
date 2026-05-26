import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { Icon } from '@iconify/react';
import { Material } from '../../models/ICourseDetail';
import { getMaterialCardIcon, resolveMaterialFileUrl } from '../../utils/materialPreview';
import { usePreviewContent } from '../../hooks/useMaterialPreviewContent';
import './MaterialPreviewModal.css';

type Props = {
  material: Material;
  onClose: () => void;
  /** Локальный файл (черновик до отправки) — без запроса на сервер */
  localFile?: File;
};

export const MaterialPreviewModal: React.FC<Props> = ({ material, onClose, localFile }) => {
  const preview = usePreviewContent(material, localFile);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!localFile) {
      setLocalBlobUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(localFile);
    setLocalBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);

  const viewUrl = localBlobUrl ?? resolveMaterialFileUrl(material.file_url);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (downloading) return;
      setDownloading(true);
      try {
        if (localFile) {
          const blobUrl = URL.createObjectURL(localFile);
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = material.title;
          anchor.rel = 'noopener noreferrer';
          anchor.click();
          URL.revokeObjectURL(blobUrl);
          return;
        }
        const res = await fetch(viewUrl);
        if (!res.ok) throw new Error('fetch failed');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = material.title;
        anchor.rel = 'noopener noreferrer';
        anchor.click();
        URL.revokeObjectURL(blobUrl);
      } catch {
        const anchor = document.createElement('a');
        anchor.href = viewUrl;
        anchor.download = material.title;
        anchor.rel = 'noopener noreferrer';
        anchor.target = '_blank';
        anchor.click();
      } finally {
        setDownloading(false);
      }
    },
    [viewUrl, material.title, downloading, localFile]
  );

  const handleOpenInNewTab = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    },
    [viewUrl]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const renderPreviewContent = () => {
    if (preview.status === 'loading') {
      return <p className="material-preview-status">Загрузка предпросмотра…</p>;
    }

    if (preview.status === 'error') {
      return (
        <p className="material-preview-status material-preview-status--error">
          Не удалось загрузить файл для предпросмотра.
        </p>
      );
    }

    const { content } = preview;

    switch (content.variant) {
      case 'image':
        return (
          <img
            src={content.url}
            alt={material.title}
            className="material-preview-image"
          />
        );
      case 'video':
        return (
          <video
            src={content.url}
            controls
            className="material-preview-video"
            title={material.title}
          />
        );
      case 'audio':
        return (
          <div className="material-preview-audio-wrap">
            <audio src={content.url} controls className="material-preview-audio" title={material.title} />
          </div>
        );
      case 'pdf':
        return (
          <object
            data={content.url}
            type="application/pdf"
            className="material-preview-iframe"
            aria-label={material.title}
          />
        );
      case 'text':
        return (
          <pre className="material-preview-text">{content.text}</pre>
        );
      case 'html':
        return (
          <div
            className="material-preview-html"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        );
      case 'iframe':
        return (
          <iframe
            src={content.src}
            title={material.title}
            className="material-preview-iframe"
          />
        );
      case 'docviewer':
        return (
          <div className="material-preview-docviewer">
            <DocViewer
              documents={[{ uri: content.uri, fileName: content.fileName }]}
              pluginRenderers={DocViewerRenderers}
              config={{ header: { disableHeader: true } }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const bodyClass =
    preview.status === 'ready' &&
    (preview.content.variant === 'html' ||
      preview.content.variant === 'text' ||
      preview.content.variant === 'docviewer')
      ? 'material-preview-body material-preview-body--document'
      : 'material-preview-body';

  return createPortal(
    <div
      className="material-preview-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="material-preview-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-preview-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="material-preview-toolbar">
          <div className="material-preview-toolbar-main">
            <Icon
              icon={getMaterialCardIcon(material)}
              className="material-preview-toolbar-icon"
              aria-hidden
            />
            <h2 id="material-preview-title" className="material-preview-title">
              {material.title}
            </h2>
          </div>
          <div className="material-preview-toolbar-actions">
            <button
              type="button"
              className="material-preview-toolbar-btn"
              title="Открыть в новой вкладке"
              onClick={handleOpenInNewTab}
            >
              <Icon icon="mdi:open-in-new" />
            </button>
            <button
              type="button"
              className="material-preview-toolbar-btn"
              title="Скачать"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Icon icon="mdi:download-outline" />
            </button>
            <button
              type="button"
              className="material-preview-toolbar-btn material-preview-close"
              onClick={onClose}
              title="Закрыть"
              aria-label="Закрыть предпросмотр"
            >
              <Icon icon="mdi:close" />
            </button>
          </div>
        </header>

        <div className={bodyClass}>{renderPreviewContent()}</div>
      </div>
    </div>,
    document.body
  );
};
