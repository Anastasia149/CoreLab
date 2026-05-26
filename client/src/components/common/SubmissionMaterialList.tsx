import React from 'react';
import { Icon } from '@iconify/react';
import {
  SubmissionItem,
  submissionFileToMaterial,
  submissionItemLabel,
} from '../../utils/submissionContent';
import { SubmissionFilePreviewButton } from './SubmissionFilePreviewButton';
import './SubmissionMaterialList.css';

export function SubmissionMaterialList({ items }: { items: SubmissionItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="submission-material-list">
      {items.map((item, index) => (
        <li key={`${item.type}-${item.content}-${index}`} className="submission-material-list-item">
          {item.type === 'link' ? (
            <>
              <p className="submission-material-label">Ссылка</p>
              <a
                className="submission-material-link"
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
              >
                {submissionItemLabel(item)}
              </a>
            </>
          ) : (
            <>
              <p className="submission-material-label">Файл</p>
              <div className="submission-material-file-row">
                <span className="submission-material-file-name">
                  {submissionItemLabel(item)}
                </span>
                <div className="submission-material-file-actions">
                  <SubmissionFilePreviewButton
                    fileUrl={item.content}
                    fileName={submissionItemLabel(item)}
                  />
                  <a
                    className="submission-material-file-download"
                    href={item.content}
                    download={submissionFileToMaterial(item, index).title}
                    rel="noopener noreferrer"
                    title="Скачать"
                  >
                    <Icon icon="mdi:tray-arrow-down" aria-hidden />
                    <span>Скачать</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
