import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { LessonCommentMessage } from '../../../models/ILessonComment';
import { LessonCommentThread } from '../../common/LessonCommentThread';
import { useAppModal } from '../../../context/AppModalContext';
import '../../common/LessonCommentsPanel.css';

type Props = {
  lessonId: string;
};

export const StudentLessonComments: React.FC<Props> = observer(({ lessonId }) => {
  const { store } = useContext(Context);
  const { showConfirm } = useAppModal();
  const [messages, setMessages] = useState<LessonCommentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThread = useCallback(async () => {
    setLoading(true);
    try {
      const data = await store.getMyLessonCommentThread(lessonId);
      setMessages(data?.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [lessonId, store]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  const handleSend = async (body: string) => {
    const message = await store.postMyLessonComment(lessonId, body);
    if (!message) return false;
    setMessages((prev) => [...prev, message]);
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
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
    return ok;
  };

  if (loading) {
    return (
      <section className="lesson-comments-panel lesson-comments-panel--student">
        <p className="lesson-comment-thread-hint">Загрузка комментариев…</p>
      </section>
    );
  }

  return (
    <section className="lesson-comments-panel lesson-comments-panel--student">
      <LessonCommentThread
        messages={messages}
        viewerRole="student"
        onSend={handleSend}
        onDelete={handleDelete}
        sendLabel="Отправить комментарий"
      />
    </section>
  );
});
