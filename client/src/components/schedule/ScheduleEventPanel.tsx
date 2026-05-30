import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { ICourse } from '../../models/ICourse';
import {
  SCHEDULE_EVENT_TYPE_LABELS,
  ScheduleEvent,
  ScheduleEventType,
} from '../../types/scheduleEvent';
import { getCourseColor } from '../../utils/scheduleCourseColors';
import {
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
  toDateKey,
} from '../../utils/scheduleHours';
import './ScheduleEventPanel.css';

type Props = {
  selectedDate: Date;
  courses: ICourse[];
  editingEvent?: ScheduleEvent | null;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  onDelete?: (eventId: string) => void;
};

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const ScheduleEventPanel: React.FC<Props> = ({
  selectedDate,
  courses,
  editingEvent = null,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(editingEvent);
  const eventDate = editingEvent ? parseDateKey(editingEvent.date) : selectedDate;

  const [eventType, setEventType] = useState<ScheduleEventType>('task');
  const [courseId, setCourseId] = useState<number | null>(courses[0]?.id ?? null);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setEventType(editingEvent.type);
      setCourseId(editingEvent.courseId);
      setTitle(editingEvent.title);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setDescription(editingEvent.description);
    } else {
      setEventType('task');
      setCourseId(courses[0]?.id ?? null);
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
    }
    setError('');
  }, [editingEvent, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Укажите название события');
      return;
    }
    if (courseId == null) {
      setError('Выберите курс');
      return;
    }
    if (startTime >= endTime) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      setError('Курс не найден');
      return;
    }

    onSave({
      id: editingEvent?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: eventType,
      courseId: course.id,
      courseTitle: course.title,
      courseColor: getCourseColor(course.id),
      title: title.trim(),
      date: toDateKey(eventDate),
      startTime,
      endTime,
      description: description.trim(),
    });
  };

  const handleDelete = () => {
    if (!editingEvent || !onDelete) return;
    onDelete(editingEvent.id);
  };

  return (
    <>
      <button
        type="button"
        className="schedule-panel-backdrop"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <aside className="schedule-event-panel" aria-labelledby="schedule-event-panel-title">
        <div className="schedule-event-panel-header">
          <h3 id="schedule-event-panel-title">
            {isEditing ? 'Редактирование события' : 'Новое событие'}
          </h3>
          <button type="button" className="schedule-event-panel-close" onClick={onClose} aria-label="Закрыть">
            <Icon icon="mdi:close" />
          </button>
        </div>

        <p className="schedule-event-panel-date">{formatDisplayDate(eventDate)}</p>

        <form className="schedule-event-form" onSubmit={handleSubmit}>
          <fieldset className="schedule-event-field">
            <legend className="schedule-event-label">Тип события</legend>
            <div className="schedule-event-type-group" role="radiogroup" aria-label="Тип события">
              {(Object.keys(SCHEDULE_EVENT_TYPE_LABELS) as ScheduleEventType[]).map((type) => (
                <label key={type} className={`schedule-event-type-btn${eventType === type ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="eventType"
                    value={type}
                    checked={eventType === type}
                    onChange={() => setEventType(type)}
                  />
                  {SCHEDULE_EVENT_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="schedule-event-field">
            <legend className="schedule-event-label">Курс (категория)</legend>
            {courses.length === 0 ? (
              <p className="schedule-event-hint">У вас пока нет курсов для привязки события.</p>
            ) : (
              <ul className="schedule-event-course-list">
                {courses.map((course) => {
                  const color = getCourseColor(course.id);
                  const selected = courseId === course.id;
                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        className={`schedule-event-course-btn${selected ? ' selected' : ''}`}
                        onClick={() => setCourseId(course.id)}
                        style={
                          {
                            '--course-color': color,
                          } as React.CSSProperties
                        }
                      >
                        <span className="schedule-event-course-dot" aria-hidden />
                        <span className="schedule-event-course-title">{course.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </fieldset>

          <label className="schedule-event-field">
            <span className="schedule-event-label">Название</span>
            <input
              type="text"
              className="schedule-event-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название события"
              maxLength={200}
            />
          </label>

          <div className="schedule-event-time-row">
            <label className="schedule-event-field">
              <span className="schedule-event-label">Начало</span>
              <input
                type="time"
                className="schedule-event-input"
                value={startTime}
                min={`${String(SCHEDULE_START_HOUR).padStart(2, '0')}:00`}
                max={`${String(SCHEDULE_END_HOUR).padStart(2, '0')}:00`}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </label>
            <label className="schedule-event-field">
              <span className="schedule-event-label">Окончание</span>
              <input
                type="time"
                className="schedule-event-input"
                value={endTime}
                min={`${String(SCHEDULE_START_HOUR).padStart(2, '0')}:00`}
                max={`${String(SCHEDULE_END_HOUR).padStart(2, '0')}:00`}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="schedule-event-field">
            <span className="schedule-event-label">Описание</span>
            <textarea
              className="schedule-event-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительные детали (необязательно)"
              rows={4}
              maxLength={2000}
            />
          </label>

          {error && (
            <p className="schedule-event-error" role="alert">
              {error}
            </p>
          )}

          <div className="schedule-event-form-actions">
            {isEditing && onDelete && (
              <button type="button" className="schedule-event-delete" onClick={handleDelete}>
                Удалить
              </button>
            )}
            <button type="button" className="schedule-event-cancel" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="schedule-event-submit" disabled={courses.length === 0}>
              Сохранить
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};

export default ScheduleEventPanel;
