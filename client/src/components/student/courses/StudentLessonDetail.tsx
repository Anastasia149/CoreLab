import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Lesson } from '../../../models/ICourseDetail';
import { Icon } from '@iconify/react';
import $api from '../../../http';
import './StudentLessonDetail.css';
import { getLessonTypeLabel } from '../../../utils/lessonTypeDisplay';
import {
  parseSubmissionItems,
  isSubmissionCompletedOnly,
  SubmissionItem,
} from '../../../utils/submissionContent';
import { SubmissionMaterialList } from '../../common/SubmissionMaterialList';

type DraftLink = { id: string; kind: 'link'; url: string };
type DraftFile = { id: string; kind: 'file'; file: File };
type DraftItem = DraftLink | DraftFile;

type StudentSubmission = {
  id: number;
  type: string;
  content?: string | null;
  created_at: string;
};

const StudentLessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [submitMode, setSubmitMode] = useState<'completed' | 'link' | 'file'>('completed');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then((data) => setLesson(data || null));
      store.getMySubmission(lessonId).then((data) =>
        setSubmission((data as StudentSubmission | undefined) || null)
      );
    }
  }, [lessonId, store]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addDraftLink = () => {
    const url = link.trim();
    if (!url) return;
    setDraftItems((prev) => [...prev, { id: `link-${Date.now()}`, kind: 'link', url }]);
    setLink('');
    setSubmitMode('link');
  };

  const addDraftFile = () => {
    if (!file) return;
    setDraftItems((prev) => [
      ...prev,
      { id: `file-${Date.now()}`, kind: 'file', file },
    ]);
    setFile(null);
    const input = document.getElementById('assign-file') as HTMLInputElement | null;
    if (input) input.value = '';
    setSubmitMode('file');
  };

  const removeDraftItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const uploadFile = async (fileToUpload: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', fileToUpload);
    const response = await $api.post<{ url: string }>('/upload', formData);
    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || isSubmitting) return;

    const hasAttachments = draftItems.length > 0;

    if (!hasAttachments && submitMode !== 'completed') {
      alert('Добавьте хотя бы одну ссылку или файл, либо выберите «Отметить».');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!hasAttachments) {
        const newSubmission = await store.submitAssignment(
          Number(lessonId),
          'completed',
          ''
        );
        if (newSubmission) {
          setSubmission(newSubmission as StudentSubmission);
          alert('Работа успешно отправлена!');
        }
        return;
      }

      const items: SubmissionItem[] = [];
      for (const draft of draftItems) {
        if (draft.kind === 'link') {
          items.push({ type: 'link', content: draft.url, label: draft.url });
        } else {
          const url = await uploadFile(draft.file);
          items.push({
            type: 'file',
            content: url,
            label: draft.file.name,
          });
        }
      }

      const types = new Set(items.map((item) => item.type));
      const submissionType =
        types.size === 1 ? (items[0].type as 'link' | 'file') : 'mixed';

      const newSubmission = await store.submitAssignment(
        Number(lessonId),
        submissionType,
        '',
        items
      );
      if (newSubmission) {
        setSubmission(newSubmission as StudentSubmission);
        setDraftItems([]);
        alert('Работа успешно отправлена!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Ошибка при отправке работы.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!lessonId || isCancelling) return;
    if (
      !window.confirm(
        'Отозвать отправленную работу? После этого можно будет отправить решение снова.'
      )
    ) {
      return;
    }
    setIsCancelling(true);
    try {
      const ok = await store.deleteMySubmission(lessonId);
      if (ok) {
        setSubmission(null);
        setDraftItems([]);
        setLink('');
        setFile(null);
      } else {
        alert('Не удалось отменить отправку. Попробуйте позже.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (!lesson) {
    return <div className="student-lesson-loading">Загрузка…</div>;
  }

  const isAssignment = lesson.type === 'assignment';
  const hasMaterials = lesson.materials.length > 0;
  const showAfterDescription = hasMaterials || isAssignment;
  const submittedItems = submission ? parseSubmissionItems(submission) : [];
  const submittedCompletedOnly =
    submission && isSubmissionCompletedOnly(submission);

  return (
    <div className="student-lesson-container">
      <div className="lesson-page-grid">
        <header className="lesson-header">
          {lesson.type !== 'assignment' && (
            <div className="lesson-badge">{getLessonTypeLabel(lesson.type)}</div>
          )}
          <h1>{lesson.title}</h1>
        </header>

        <div className="lesson-main-content">
          <div
            className="lesson-text"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </div>

        {showAfterDescription && (
          <>
            <hr className="lesson-divider" />
            <div className="lesson-footer-plank">
              <div
                className={
                  isAssignment
                    ? 'lesson-after-row lesson-after-row--with-sidebar'
                    : 'lesson-after-row'
                }
              >
                <div className="lesson-after-main">
                  {hasMaterials && (
                    <div className="lesson-materials-section">
                      <h3 className="lesson-plank-section-title">Материалы</h3>
                      <div className="materials-grid">
                        {lesson.materials.map((m) => (
                          <a
                            key={m.id}
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="material-card"
                          >
                            <Icon icon="mdi:file-document-outline" />
                            <span>{m.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isAssignment && (
                  <aside className="lesson-sidebar">
                    <div className="submission-card">
                      <h3 className="lesson-plank-section-title">Ваше решение</h3>

                      {submission ? (
                        <div className="submission-done">
                          <div className="submission-status success">
                            <Icon icon="mdi:check-circle" />
                            <div>
                              <p className="status-title">Работа отправлена</p>
                              <p className="status-date">
                                {new Date(submission.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {submittedCompletedOnly ? (
                            <p className="submission-sent-summary">
                              Задание отмечено как выполненное.
                            </p>
                          ) : (
                            <div className="submission-sent-materials">
                              <p className="submission-sent-heading">Отправлено:</p>
                              <SubmissionMaterialList items={submittedItems} />
                            </div>
                          )}

                          <button
                            type="button"
                            className="submission-cancel-btn"
                            onClick={handleCancelSubmission}
                            disabled={isCancelling}
                          >
                            {isCancelling ? 'Отмена…' : 'Отменить'}
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="submission-form">
                          <div className="submit-type-selector">
                            <button
                              type="button"
                              className={submitMode === 'completed' ? 'active' : ''}
                              onClick={() => setSubmitMode('completed')}
                            >
                              Отметить
                            </button>
                            <button
                              type="button"
                              className={submitMode === 'link' ? 'active' : ''}
                              onClick={() => setSubmitMode('link')}
                            >
                              Ссылка
                            </button>
                            <button
                              type="button"
                              className={submitMode === 'file' ? 'active' : ''}
                              onClick={() => setSubmitMode('file')}
                            >
                              Файл
                            </button>
                          </div>

                          {submitMode === 'link' && (
                            <div className="submission-add-row">
                              <input
                                type="url"
                                placeholder="Ссылка на работу"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="submit-input"
                              />
                              <button
                                type="button"
                                className="submission-add-btn"
                                onClick={addDraftLink}
                                disabled={!link.trim()}
                              >
                                Добавить
                              </button>
                            </div>
                          )}

                          {submitMode === 'file' && (
                            <div className="submission-add-row submission-add-row--file">
                              <div className="file-input-wrapper">
                                <input
                                  type="file"
                                  id="assign-file"
                                  onChange={handleFileChange}
                                  className="hidden-file-input"
                                />
                                <label htmlFor="assign-file" className="file-label">
                                  <Icon icon="mdi:cloud-upload-outline" />
                                  {file ? file.name : 'Выберите файл'}
                                </label>
                              </div>
                              <button
                                type="button"
                                className="submission-add-btn"
                                onClick={addDraftFile}
                                disabled={!file}
                              >
                                Добавить
                              </button>
                            </div>
                          )}

                          {draftItems.length > 0 && (
                            <ul className="submission-draft-list">
                              {draftItems.map((item) => (
                                <li key={item.id} className="submission-draft-item">
                                  <Icon
                                    icon={
                                      item.kind === 'link'
                                        ? 'mdi:link-variant'
                                        : 'mdi:file-outline'
                                    }
                                  />
                                  <span className="submission-draft-label">
                                    {item.kind === 'link' ? item.url : item.file.name}
                                  </span>
                                  <button
                                    type="button"
                                    className="submission-draft-remove"
                                    onClick={() => removeDraftItem(item.id)}
                                    aria-label="Удалить"
                                  >
                                    <Icon icon="mdi:close" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}

                          {submitMode === 'completed' && draftItems.length === 0 && (
                            <p className="submission-hint">
                              Отметьте задание выполненным или добавьте ссылки и файлы.
                            </p>
                          )}

                          <button
                            type="submit"
                            className="submit-btn"
                            disabled={
                              isSubmitting ||
                              (draftItems.length === 0 && submitMode !== 'completed')
                            }
                          >
                            {isSubmitting ? 'Отправка...' : 'Отправить работу'}
                          </button>
                        </form>
                      )}
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default observer(StudentLessonDetail);


