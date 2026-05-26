import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { LessonCommentMessage } from '../../models/ILessonComment';
import './LessonCommentThread.css';

type Props = {
  messages: LessonCommentMessage[];
  viewerRole: 'student' | 'teacher';
  studentName?: string;
  onSend: (body: string) => Promise<boolean>;
  onDelete?: (messageId: number) => Promise<boolean>;
  sendLabel?: string;
  compact?: boolean;
  showTitle?: boolean;
  hint?: string;
  canSend?: boolean;
};

function formatCommentTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function canDeleteMessage(msg: LessonCommentMessage, viewerRole: 'student' | 'teacher'): boolean {
  if (viewerRole === 'student') return msg.authorRole === 'student';
  return true;
}

export function LessonCommentThread({
  messages,
  viewerRole,
  studentName,
  onSend,
  onDelete,
  sendLabel = 'Отправить',
  compact = false,
  showTitle = true,
  hint,
  canSend = true,
}: Props) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const ok = await onSend(body);
      if (ok) setDraft('');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    if (!onDelete || deletingId != null) return;
    setDeletingId(messageId);
    try {
      await onDelete(messageId);
    } finally {
      setDeletingId(null);
    }
  };

  const authorLabel = (msg: LessonCommentMessage) => {
    if (msg.authorRole === 'teacher') return 'Преподаватель';
    if (viewerRole === 'teacher' && studentName) return studentName;
    return 'Вы';
  };

  return (
    <div
      className={
        compact
          ? 'lesson-comment-thread lesson-comment-thread--compact'
          : 'lesson-comment-thread'
      }
    >
      {showTitle && <h3 className="lesson-comment-thread-title">Комментарии</h3>}
      {hint && <p className="lesson-comment-thread-hint">{hint}</p>}

      {messages.length > 0 ? (
        <ul className="lesson-comment-messages">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={`lesson-comment-message lesson-comment-message--${msg.authorRole}`}
            >
              <div className="lesson-comment-message-meta">
                <span className="lesson-comment-message-author">{authorLabel(msg)}</span>
                <div className="lesson-comment-message-actions">
                  <time dateTime={msg.createdAt}>{formatCommentTime(msg.createdAt)}</time>
                  {onDelete && canDeleteMessage(msg, viewerRole) && (
                    <button
                      type="button"
                      className="lesson-comment-delete-btn"
                      onClick={() => void handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      title="Удалить"
                      aria-label="Удалить комментарий"
                    >
                      <Icon icon="mdi:trash-can-outline" />
                    </button>
                  )}
                </div>
              </div>
              <p className="lesson-comment-message-body">{msg.body}</p>
            </li>
          ))}
        </ul>
      ) : viewerRole === 'student' ? (
        <p className="lesson-comment-thread-hint">
          Пока нет сообщений. Напишите преподавателю.
        </p>
      ) : null}

      {canSend ? (
        <form className="lesson-comment-form" onSubmit={(e) => void handleSubmit(e)}>
          <textarea
            className="lesson-comment-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              viewerRole === 'student'
                ? 'Ваш комментарий преподавателю…'
                : 'Ответ ученику…'
            }
            maxLength={2000}
            disabled={sending}
          />
          <button
            type="submit"
            className="lesson-comment-submit"
            disabled={sending || !draft.trim()}
          >
            {sending ? 'Отправка…' : sendLabel}
          </button>
        </form>
      ) : null}
    </div>
  );
}
