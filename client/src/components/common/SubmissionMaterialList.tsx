import React from 'react';
import { Icon } from '@iconify/react';
import { SubmissionItem } from '../../utils/submissionContent';
import './SubmissionMaterialList.css';

function isLikelyImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)(\?|#|$)/i.test(url);
}

function displayLabel(item: SubmissionItem): string {
  if (item.label?.trim()) return item.label.trim();
  return item.content;
}

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
                {displayLabel(item)}
              </a>
            </>
          ) : (
            <>
              <p className="submission-material-label">Файл</p>
              <a
                className="submission-material-file"
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon="mdi:tray-arrow-down" />
                {displayLabel(item)}
              </a>
              {isLikelyImageUrl(item.content) && (
                <a
                  href={item.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="submission-material-image-wrap"
                >
                  <img src={item.content} alt={displayLabel(item)} className="submission-material-image" />
                </a>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
