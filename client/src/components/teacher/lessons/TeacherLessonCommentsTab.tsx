import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import { LessonCommentThread } from '../../common/LessonCommentThread';
import { LessonCommentThread as ThreadType } from '../../../models/ILessonComment';
import { useAppModal } from '../../../context/AppModalContext';
import '../../common/LessonCommentsPanel.css';

type Props = {
  lessonId: string;
  initialStudentId?: number | null;
};

export const TeacherLessonCommentsTab: React.FC<Props> = observer(
  ({ lessonId, initialStudentId }) => {
    const { store } = useContext(Context);
    const { showConfirm } = useAppModal();
    const [threads, setThreads] = useState<ThreadType[]>([]);
    const [loading, setLoading] = useState(true);
    const [openStudentId, setOpenStudentId] = useState<number | null>(
      initialStudentId ?? null
    );

    const loadThreads = useCallback(async () => {
      setLoading(true);
      try {
        const data = await store.getLessonCommentThreads(lessonId);
        setThreads(data?.threads ?? []);
      } finally {
        setLoading(false);
      }
    }, [lessonId, store]);

    useEffect(() => {
      void loadThreads();
    }, [loadThreads]);

    useEffect(() => {
      if (initialStudentId != null) {
        setOpenStudentId(initialStudentId);
      }
    }, [initialStudentId]);

    const handleReply = async (studentId: number, body: string) => {
      const message = await store.postLessonCommentReply(lessonId, studentId, body);
      if (!message) return false;
      setThreads((prev) =>
        prev.map((thread) =>
          thread.studentId === studentId
            ? { ...thread, messages: [...thread.messages, message] }
            : thread
        )
      );
      void store.fetchNotifications();
      return true;
    };

    const handleDelete = async (studentId: number, messageId: number) => {
      const confirmed = await showConfirm('Удалить этот комментарий?', {
        title: 'Удаление',
        confirmText: 'Удалить',
        danger: true,
      });
      if (!confirmed) return false;

      const ok = await store.deleteLessonCommentMessage(lessonId, messageId);
      if (!ok) return false;

      setThreads((prev) => {
        const next = prev
          .map((thread) =>
            thread.studentId === studentId
              ? {
                  ...thread,
                  messages: thread.messages.filter((m) => m.id !== messageId),
                }
              : thread
          )
          .filter((thread) => thread.messages.length > 0);
        return next;
      });
      return true;
    };

    if (loading) {
      return <p className="teacher-comment-thread-empty">Загрузка комментариев…</p>;
    }

    if (threads.length === 0) {
      return (
        <p className="teacher-comment-thread-empty">
          Пока ни один ученик не оставил комментарий к этому уроку.
        </p>
      );
    }

    return (
      <>
        <p className="teacher-comments-tab-intro">
          Комментарии учеников к уроку. Выберите переписку, чтобы прочитать и ответить.
        </p>
        <div className="teacher-comment-threads">
          {threads.map((thread) => {
            const isOpen = openStudentId === thread.studentId;
            const lastMessage = thread.messages[thread.messages.length - 1];
            const preview = lastMessage?.body ?? '';

            return (
              <article key={thread.studentId} className="teacher-comment-thread-card">
                <button
                  type="button"
                  className="teacher-comment-thread-toggle"
                  onClick={() =>
                    setOpenStudentId((id) =>
                      id === thread.studentId ? null : thread.studentId
                    )
                  }
                  aria-expanded={isOpen}
                >
                  <span className="teacher-comment-thread-toggle-main">
                    <span className="teacher-comment-thread-student">
                      {thread.studentName}
                    </span>
                    {!isOpen && preview && (
                      <span className="teacher-comment-thread-preview">{preview}</span>
                    )}
                  </span>
                  <Icon
                    icon="mdi:chevron-down"
                    className={`teacher-comment-thread-chevron${
                      isOpen ? ' teacher-comment-thread-chevron--open' : ''
                    }`}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div className="teacher-comment-thread-body">
                    <LessonCommentThread
                      messages={thread.messages}
                      viewerRole="teacher"
                      studentName={thread.studentName}
                      onSend={(body) => handleReply(thread.studentId, body)}
                      onDelete={(messageId) => handleDelete(thread.studentId, messageId)}
                      sendLabel="Ответить"
                      compact
                      showTitle={false}
                      canSend={thread.messages.some((m) => m.authorRole === 'student')}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </>
    );
  }
);
