import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { LessonCommentMessage } from '../../../models/ILessonComment';
import { LessonCommentThread } from '../../common/LessonCommentThread';
import { useAppModal } from '../../../context/AppModalContext';
import '../../common/LessonCommentsPanel.css';

type Props = {
  lessonId: string;
  studentId: number;
  studentName: string;
  initialMessages?: LessonCommentMessage[];
  onThreadUpdated?: () => void;
};

export const TeacherSubmissionCommentBlock: React.FC<Props> = observer(
  ({ lessonId, studentId, studentName, initialMessages, onThreadUpdated }) => {
    const { store } = useContext(Context);
    const { showConfirm } = useAppModal();
    const [allMessages, setAllMessages] = useState<LessonCommentMessage[]>(
      initialMessages ?? []
    );
    const [loaded, setLoaded] = useState(initialMessages != null);

    const loadThreads = useCallback(async () => {
      try {
        const data = await store.getLessonCommentThreads(lessonId);
        const thread = data?.threads?.find((t) => t.studentId === studentId);
        setAllMessages(thread?.messages ?? []);
      } finally {
        setLoaded(true);
      }
    }, [lessonId, studentId, store]);

    useEffect(() => {
      if (initialMessages != null) {
        setAllMessages(initialMessages);
        setLoaded(true);
        return;
      }
      void loadThreads();
    }, [loadThreads, initialMessages]);

    const messages = useMemo(
      () => allMessages.filter((m) => m.studentId === studentId),
      [allMessages, studentId]
    );

    const handleReply = async (body: string) => {
      const message = await store.postLessonCommentReply(lessonId, studentId, body);
      if (!message) return false;
      setAllMessages((prev) => [...prev, message]);
      onThreadUpdated?.();
      void store.fetchNotifications();
      return true;
    };

    const handleDelete = async (messageId: number) => {
      const confirmed = await showConfirm('Удалить этот комментарий?', {
        title: 'Удаление',
        confirmText: 'Удалить',
        danger: true,
      });
      if (!confirmed) return false;

      const ok = await store.deleteLessonCommentMessage(lessonId, messageId);
      if (ok) {
        setAllMessages((prev) => prev.filter((m) => m.id !== messageId));
        onThreadUpdated?.();
      }
      return ok;
    };

    if (!loaded) {
      return (
        <div className="submission-comment-block">
          <p className="lesson-comment-thread-hint">Загрузка комментариев…</p>
        </div>
      );
    }

    const hasStudentMessage = messages.some((m) => m.authorRole === 'student');

    return (
      <div className="submission-comment-block">
        <LessonCommentThread
          messages={messages}
          viewerRole="teacher"
          studentName={studentName}
          onSend={handleReply}
          onDelete={handleDelete}
          sendLabel="Ответить ученику"
          compact
          showTitle={true}
          canSend={hasStudentMessage}
          hint={
            hasStudentMessage
              ? 'Личные комментарии с этим учеником по уроку.'
              : 'Ученик ещё не писал комментарий — ответ будет доступен после его сообщения.'
          }
        />
      </div>
    );
  }
);
