import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Lesson } from '../../../models/ICourseDetail';
import { Icon } from '@iconify/react';
import $api from '../../../http';
import './StudentLessonDetail.css';
import { getLessonTypeIcon, getLessonTypeLabel, normalizeLessonType } from '../../../utils/lessonTypeDisplay';
import {
  parseTestQuestions,
  parseTestSubmission,
  formatTestScoreLabel,
  isTestSubmissionType,
} from '../../../utils/testContent';
import { StudentTestPanel } from './StudentTestPanel';
import './StudentTestPanel.css';
import {
  parseSubmissionItems,
  isSubmissionCompletedOnly,
  SubmissionItem,
} from '../../../utils/submissionContent';
import { SubmissionMaterialList } from '../../common/SubmissionMaterialList';
import {
  getReviewStatusLabel,
  normalizeReviewStatus,
} from '../../../utils/submissionReview';
import { lessonTypeHasDeadline } from '../../../utils/lessonDeadline';
import { LessonDeadlineInfo } from '../../common/LessonDeadlineInfo';
import { SubmissionOverdueBadge } from '../../common/SubmissionOverdueBadge';
import { useAppModal } from '../../../context/AppModalContext';
import {
  ASSIGNMENT_FILE_MAX_BYTES,
  formatFileSize,
  getAssignmentFileSizeError,
} from '../../../constants/fileLimits';

type DraftLink = { id: string; kind: 'link'; url: string };
type DraftFile = { id: string; kind: 'file'; file: File };
type DraftItem = DraftLink | DraftFile;

type StudentSubmission = {
  id: number;
  type: string;
  content?: string | null;
  created_at: string;
  review_status?: string | null;
  is_overdue?: boolean;
};

const StudentLessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);
  const { showAlert, showConfirm } = useAppModal();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [submitMode, setSubmitMode] = useState<'completed' | 'link' | 'file'>('completed');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [takingTest, setTakingTest] = useState(false);

  useEffect(() => {
    if (lessonId) {
      store.getLesson(lessonId).then((data) => setLesson(data || null));
      store.getMySubmission(lessonId).then((data) =>
        setSubmission((data as StudentSubmission | undefined) || null)
      );
    }
  }, [lessonId, store]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selected = input.files?.[0];
    if (!selected) return;

    const sizeError = getAssignmentFileSizeError(selected);
    if (sizeError) {
      await showAlert(sizeError);
      input.value = '';
      return;
    }

    setFile(selected);
  };

  const addDraftLink = () => {
    const url = link.trim();
    if (!url) return;
    setDraftItems((prev) => [...prev, { id: `link-${Date.now()}`, kind: 'link', url }]);
    setLink('');
    setSubmitMode('link');
  };

  const addDraftFile = async () => {
    if (!file) return;

    const sizeError = getAssignmentFileSizeError(file);
    if (sizeError) {
      await showAlert(sizeError);
      return;
    }

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
      await showAlert('Добавьте хотя бы одну ссылку или файл, либо выберите «Отметить».');
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
          await showAlert('Работа успешно отправлена!', { title: 'Готово' });
        }
        return;
      }

      const items: SubmissionItem[] = [];
      for (const draft of draftItems) {
        if (draft.kind === 'link') {
          items.push({ type: 'link', content: draft.url, label: draft.url });
        } else {
          const sizeError = getAssignmentFileSizeError(draft.file);
          if (sizeError) {
            await showAlert(sizeError);
            return;
          }
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
        await showAlert('Работа успешно отправлена!', { title: 'Готово' });
      }
    } catch (error) {
      console.error('Submission failed:', error);
      await showAlert('Ошибка при отправке работы.', { title: 'Ошибка' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitTest = async (answers: Record<string, string[]>) => {
    if (!lessonId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newSubmission = await store.submitTest(Number(lessonId), answers);
      if (newSubmission) {
        setSubmission(newSubmission as StudentSubmission);
        setTakingTest(false);
        await showAlert('Тест успешно отправлен!', { title: 'Готово' });
      } else {
        await showAlert('Не удалось отправить тест. Попробуйте позже.', { title: 'Ошибка' });
      }
    } catch (error) {
      console.error('Test submission failed:', error);
      await showAlert('Ошибка при отправке теста.', { title: 'Ошибка' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!lessonId || isCancelling) return;
    const confirmed = await showConfirm(
      'Отозвать отправленную работу? После этого можно будет отправить решение снова.\n\nПрикрепленные файлы не будут доступны.',
      { title: 'Отозвать работу', confirmText: 'Отозвать', danger: true }
    );
    if (!confirmed) return;
    setIsCancelling(true);
    try {
      const ok = await store.deleteMySubmission(lessonId);
      if (ok) {
        setSubmission(null);
        setTakingTest(false);
        setDraftItems([]);
        setLink('');
        setFile(null);
      } else {
        await showAlert('Не удалось отменить отправку. Попробуйте позже.', { title: 'Ошибка' });
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (!lesson) {
    return <div className="student-lesson-loading">Загрузка…</div>;
  }

  const lessonType = normalizeLessonType(lesson.type);
  const isAssignment = lessonType === 'assignment';
  const isTest = lessonType === 'test';
  const showsDeadlineInfo = lessonTypeHasDeadline(lesson.type);
  const hasMaterials = lesson.materials.length > 0;
  const testQuestions = isTest ? parseTestQuestions(lesson.content) : [];
  const showAfterDescription = hasMaterials || isAssignment || isTest || showsDeadlineInfo;
  const submittedItems = submission ? parseSubmissionItems(submission) : [];
  const submittedCompletedOnly =
    submission && isSubmissionCompletedOnly(submission);
  const testResult =
    submission && isTestSubmissionType(submission.type)
      ? parseTestSubmission(submission.content)
      : null;
  const reviewStatus = submission
    ? normalizeReviewStatus(submission.review_status)
    : 'pending';
  const showLessonHtml =
    !isTest && lesson.content?.trim() && !lesson.content.trim().startsWith('[');

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
          {isTest && takingTest && !submission ? (
            <StudentTestPanel
              questions={testQuestions}
              onSubmit={handleSubmitTest}
              onCancel={() => setTakingTest(false)}
              isSubmitting={isSubmitting}
            />
          ) : showLessonHtml ? (
            <div
              className="lesson-text"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          ) : null}
        </div>

        {showAfterDescription && (
          <>
            <hr className="lesson-divider" />
            <div className="lesson-footer-plank">
              <div
                className={
                  isAssignment || isTest
                    ? 'lesson-after-row lesson-after-row--with-sidebar'
                    : 'lesson-after-row'
                }
              >
                <div className="lesson-after-main">
                  {showsDeadlineInfo && !isAssignment && (
                    <LessonDeadlineInfo
                      deadline={lesson.deadline}
                      lessonType={lesson.type}
                      className="lesson-deadline-info--main"
                    />
                  )}
                  {(hasMaterials || isTest) && (
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
                        {isTest && (
                          <button
                            type="button"
                            className="material-card test-material-card"
                            onClick={() => {
                              if (submission) return;
                              if (testQuestions.length === 0) {
                                void showAlert('Тест пока не содержит вопросов.');
                                return;
                              }
                              setTakingTest(true);
                            }}
                            disabled={!!submission || testQuestions.length === 0}
                          >
                            <Icon icon={getLessonTypeIcon('test')} />
                            <span>тест</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {(isAssignment || isTest) && (
                  <aside className="lesson-sidebar">
                    <div className="submission-card">
                      <h3 className="lesson-plank-section-title">Ваше решение</h3>

                      {showsDeadlineInfo && (
                        <LessonDeadlineInfo
                          deadline={lesson.deadline}
                          lessonType={lesson.type}
                        />
                      )}

                      {submission ? (
                        <div className="submission-done">
                          <div className="submission-status success">
                            <Icon icon="mdi:check-circle" />
                            <div>
                              <p className="status-title">Работа отправлена</p>
                              <p className="status-date">
                                {new Date(submission.created_at).toLocaleDateString('ru-RU')}
                              </p>
                            </div>
                          </div>

                          <div className="submission-status-row">
                            <p
                              className={`submission-review-badge submission-review-badge--${reviewStatus}`}
                            >
                              {getReviewStatusLabel(reviewStatus)}
                            </p>
                            {submission.is_overdue &&
                              (isTest ? (
                                <span className="submission-overdue-inline">с опозданием</span>
                              ) : (
                                <SubmissionOverdueBadge />
                              ))}
                          </div>

                          {testResult && (
                            <p className="submission-test-score">
                              {formatTestScoreLabel(
                                testResult.correctCount,
                                testResult.totalCount
                              )}
                            </p>
                          )}

                          {!testResult && submittedCompletedOnly && (
                            <p className="submission-sent-summary">
                              Задание отмечено как выполненное.
                            </p>
                          )}

                          {!testResult && !submittedCompletedOnly && (
                            <div className="submission-sent-materials">
                              <p className="submission-sent-heading">Отправлено:</p>
                              <SubmissionMaterialList items={submittedItems} />
                            </div>
                          )}

                          {!isTest && (
                            <button
                              type="button"
                              className="submission-cancel-btn"
                              onClick={handleCancelSubmission}
                              disabled={isCancelling}
                            >
                              {isCancelling ? 'Отмена…' : 'Отменить'}
                            </button>
                          )}
                        </div>
                      ) : isTest ? (
                        <p className="submission-hint">
                          {takingTest
                            ? 'Заполните тест слева и нажмите «Отправить».'
                            : 'Нажмите «тест» в материалах, чтобы начать.'}
                        </p>
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
                                <p className="submission-file-hint">
                                  Максимальный размер файла — {formatFileSize(ASSIGNMENT_FILE_MAX_BYTES)}
                                </p>
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


