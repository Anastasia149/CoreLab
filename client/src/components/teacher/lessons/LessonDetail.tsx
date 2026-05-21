import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from '../../../index';
import { Lesson } from '../../../models/ICourseDetail';
import TeacherSidebar from '../dashboard/components/TeacherSidebar';
import TeacherHeader from '../dashboard/components/TeacherHeader';
import { Icon } from '@iconify/react';
import '../dashboard/TeacherLayout.css';
import '../courses/CreateLesson.css';
import { TeacherSubmissionMaterial, LessonSubmissionRow } from './lessonSubmissionDisplay';
import { SubmissionReviewControls } from './SubmissionReviewControls';
import { partitionSubmissionsByReview } from '../../../utils/submissionReview';
import { SubmissionOverdueBadge } from '../../common/SubmissionOverdueBadge';
import { LessonDeadlineInfo } from '../../common/LessonDeadlineInfo';
import { ICourseStudent } from '../../../models/ICourseStudent';

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { store } = useContext(Context);
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [submissions, setSubmissions] = useState<LessonSubmissionRow[]>([]);
  const [courseStudents, setCourseStudents] = useState<ICourseStudent[]>([]);
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    if (!lessonId) return;
    store.getLesson(lessonId).then((data) => {
      setLesson(data || null);
      if (data?.type === 'test') {
        setActiveTab((tab) => (tab === 'materials' ? 'students' : tab));
      }
    });
  }, [lessonId, store]);

  useEffect(() => {
    if (!lessonId || !lesson) return;
    if (lesson.type === 'assignment' || lesson.type === 'test') {
      store.getLessonSubmissions(lessonId).then((subs) => {
        setSubmissions(Array.isArray(subs) ? subs : []);
      });
    } else {
      setSubmissions([]);
    }
  }, [lessonId, lesson, store]);

  useEffect(() => {
    if (!lesson || lesson.type !== 'test' || !lesson.course_id) {
      setCourseStudents([]);
      return;
    }
    store.getCourseStudents(lesson.course_id).then((list) => {
      setCourseStudents(Array.isArray(list) ? list : []);
    });
  }, [lesson, store]);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      if (lessonId) {
        await store.deleteLesson(lessonId);
        navigate(`/teacher/course/${lesson?.course_id}`);
      }
    }
  };

  const handleReviewSubmission = async (
    submissionId: number,
    status: 'passed' | 'failed'
  ): Promise<boolean> => {
    const updated = await store.updateSubmissionReview(submissionId, status);
    if (!updated) {
      alert('Не удалось сохранить оценку. Попробуйте позже.');
      return false;
    }
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, review_status: (updated as LessonSubmissionRow).review_status ?? status }
          : s
      )
    );
    return true;
  };

  const isTestLesson = lesson?.type === 'test';
  const { pending: pendingSubmissions, reviewed: reviewedSubmissions } =
    partitionSubmissionsByReview(submissions);

  const submittedStudentIds = new Set(
    submissions
      .map((s) => Number(s.student_id))
      .filter((id) => !Number.isNaN(id) && id > 0)
  );

  const testPassedSubmissions = isTestLesson ? submissions : [];
  const testNotPassedStudents = isTestLesson
    ? courseStudents.filter((s) => !submittedStudentIds.has(Number(s.id)))
    : [];

  const renderSubmissionCard = (s: LessonSubmissionRow) => (
      <div key={s.id} className="submission-item submission-item--card">
        <div className="submission-item-header">
          <div className="submission-user">
            <Icon icon="solar:user-circle-linear" />
            <span>{s.student_name || 'Ученик'}</span>
          </div>
          {isTestLesson ? (
            <span className="submission-status-pill submission-status-pill--passed">
              Сдал
            </span>
          ) : (
            <span className="submission-status-pill submission-status-pill--submitted">
              Работа получена
            </span>
          )}
          {s.is_overdue && <SubmissionOverdueBadge />}
          <div className="submission-date">
            {new Date(s.created_at).toLocaleString('ru-RU')}
          </div>
        </div>
        <TeacherSubmissionMaterial s={s} />
        {lesson?.type === 'assignment' && (
          <SubmissionReviewControls
            submissionId={s.id}
            reviewStatus={s.review_status}
            onReview={handleReviewSubmission}
          />
        )}
      </div>
    );

  const renderNotPassedStudentCard = (student: ICourseStudent) => {
    const displayName = student.name?.trim() || student.email || 'Ученик';
    return (
      <div
        key={student.id}
        className="submission-item submission-item--card submission-item--not-passed"
      >
        <div className="submission-item-header">
          <div className="submission-user">
            <Icon icon="solar:user-circle-linear" />
            <span>{displayName}</span>
          </div>
          <span className="submission-status-pill submission-status-pill--not-passed">
            Не сдал
          </span>
        </div>
        <p className="submission-not-passed-text">Тест не пройден</p>
      </div>
    );
  };

  const renderSubmissionsSection = (
    title: string,
    items: LessonSubmissionRow[],
    emptyText: string
  ) => (
    <section className="submissions-section">
      <h3 className="submissions-section-title">
        {title}
        <span className="submissions-section-count">{items.length}</span>
      </h3>
      {items.length === 0 ? (
        <p className="submissions-section-empty">{emptyText}</p>
      ) : (
        <div className="submissions-list">{items.map(renderSubmissionCard)}</div>
      )}
    </section>
  );

  const renderNotPassedSection = (
    title: string,
    students: ICourseStudent[],
    emptyText: string
  ) => (
    <section className="submissions-section">
      <h3 className="submissions-section-title">
        {title}
        <span className="submissions-section-count">{students.length}</span>
      </h3>
      {students.length === 0 ? (
        <p className="submissions-section-empty">{emptyText}</p>
      ) : (
        <div className="submissions-list">
          {students.map(renderNotPassedStudentCard)}
        </div>
      )}
    </section>
  );

  return (
    <div className="teacher-layout">
      <TeacherSidebar />
      <main className="teacher-content">
        <TeacherHeader name={lesson?.title || 'Урок'} />
        <div className="teacher-courses-page lesson-detail-page">
          {!lesson ? (
            <div>Загрузка...</div>
          ) : (
            <>
              <h1>{lesson.title}</h1>

              <LessonDeadlineInfo
                deadline={lesson.deadline}
                lessonType={lesson.type}
                audience="teacher"
                className="lesson-deadline-info--teacher-page"
              />

              <div className="lesson-detail-tabs">
                {lesson.type !== 'test' && (
                  <button
                    type="button"
                    className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                  >
                    Материалы
                  </button>
                )}
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  {'Работы учеников'}
                </button>
                <button
                  type="button"
                  className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  Настройки урока
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'students' && (
                  <div className="students-tab">
                    {lesson.type === 'lecture' ? (
                      <p className="info-text">Для лекций не предусмотрена сдача работ.</p>
                    ) : (
                      <>
                        <p className="students-tab-intro">
                          {lesson.type === 'assignment'
                            ? 'Здесь отображаются ученики, которые отправили работу по этому заданию, и то, что они прикрепили.'
                            : lesson.type === 'test'
                              ? 'Ученики курса, которые сдали тест, и те, кто его ещё не прошёл.'
                              : 'Ответы учеников по этому уроку (если предусмотрены).'}
                        </p>
                        {lesson.type === 'test' ? (
                          <div className="submissions-sections">
                            {renderSubmissionsSection(
                              'Сдал',
                              testPassedSubmissions,
                              'Пока никто не сдал тест.'
                            )}
                            {renderNotPassedSection(
                              'Не сдал',
                              testNotPassedStudents,
                              courseStudents.length === 0
                                ? 'На курс пока никто не записался.'
                                : 'Все записанные на курс ученики сдали тест.'
                            )}
                          </div>
                        ) : submissions.length === 0 ? (
                          <p className="info-text">Работ пока никто не отправил.</p>
                        ) : (
                          <div className="submissions-sections">
                            {renderSubmissionsSection(
                              'На проверку',
                              pendingSubmissions,
                              'Нет работ, ожидающих проверки.'
                            )}
                            {renderSubmissionsSection(
                              'Проверено',
                              reviewedSubmissions,
                              'Пока нет проверенных работ.'
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'materials' && lesson.type !== 'test' && (
                  <div className="materials-tab">
                    {lesson.materials.length === 0 ? (
                      <p>Материалов пока нет.</p>
                    ) : (
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
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="lesson-settings-tab">
                    <button
                      type="button"
                      className="lesson-action-btn edit"
                      onClick={() => navigate(`/teacher/lesson/${lessonId}/edit`)}
                    >
                      Редактировать урок
                    </button>
                    <button type="button" className="lesson-action-btn delete" onClick={handleDelete}>
                      Удалить урок
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default observer(LessonDetail);

