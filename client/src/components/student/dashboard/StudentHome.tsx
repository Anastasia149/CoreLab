import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../teacher/courses/TeacherCourses.css';
import '../../student/courses/StudentMyCourses.css';
import './StudentHome.css';
import { Icon } from '@iconify/react';
import { Context } from '../../../index';
import StudentCalendar from './components/StudentCalendar';
import StudentSchedule from './components/StudentSchedule';
import illustration from '../../home/pictures/Online learning-bro.svg';
import { getCourseProgressTotals } from '../../../utils/courseProgress';
import { getCourseCoverUrl } from '../../../constants/courseCover';
import { IStudentTodayTask } from '../../../models/IStudentTodayTask';
import { formatDeadline } from '../../../utils/lessonDeadline';

function todayTaskIcon(type: IStudentTodayTask['lessonType']): string {
  return type === 'test' ? 'mdi:clipboard-check-outline' : 'mdi:clipboard-text-outline';
}

const StudentHome: React.FC = () => {
  const { store } = useContext(Context);
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState<IStudentTodayTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setTasksLoading(true);
      await store.refreshMyCourses();
      const tasks = await store.getStudentTodayTasks();
      if (!cancelled) {
        setTodayTasks(tasks);
        setTasksLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [store]);

  return (
    <div className="student-grid">
      <section className="student-hero-card">
        <div className="student-hero-text">
          <div className="student-hero-title">Учитесь и растите</div>
          <div className="student-hero-sub">Новые занятия уже ждут</div>
        </div>
        <div className="student-hero-art">
          <img src={illustration} alt="Illustration" className="student-hero-illustration" />
        </div>
      </section>

      <section className="student-calendar">
        <StudentCalendar />
      </section>

      <div className="student-courses-group">
        <div className="student-section-title">
          Мои курсы
          {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 2 && (
            <button className="teacher-show-all" onClick={() => navigate('/student/my-courses')}>
              Показать все
            </button>
          )}
        </div>
        <div className="student-courses">
          {Array.isArray((store.user as any)?.courses) && (store.user as any).courses.length > 0 ? (
            <div className="teacher-courses-grid-home">
              {(store.user as any).courses.slice(0, 2).map((course: any) => {
                const { completed, total, percent } = getCourseProgressTotals(course);

                return (
                  <Link to={`/student/my-courses/${course.id}`} key={course.id} className="student-course-card-link">
                    <div className="course-card">
                      <img src={getCourseCoverUrl(course.image_url)} alt={course.title} className="course-card-image" />
                      <div className="course-card-body">
                        <div className="course-card-title">{course.title}</div>
                        <div className="course-card-description">{course.description}</div>
                        <div className="student-course-progress">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                          </div>
                          <span className="progress-text">
                            {total > 0 ? `${completed}/${total} заданий` : '0% пройдено'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="teacher-empty">
              У вас пока нет курсов! Вы можете найти их в разделе «поиск»!
            </div>
          )}
        </div>
      </div>

      <section className="student-schedule-box">
        <StudentSchedule />
      </section>

      <div className="student-tasks-group">
        <div className="student-section-title">Задачи на сегодня</div>
        <div className="student-tasks">
          {tasksLoading ? (
            <p className="student-tasks-status">Загрузка…</p>
          ) : todayTasks.length === 0 ? (
            <p className="student-tasks-status">
              На сегодня нет заданий и тестов с дедлайном
            </p>
          ) : (
            <div className="student-tasks-list">
              {todayTasks.map((task) => (
                <div
                  key={task.lessonId}
                  className={`student-task${task.isCompleted ? ' student-task--done' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/student/lesson/${task.lessonId}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/student/lesson/${task.lessonId}`);
                    }
                  }}
                >
                  <div className="student-task-content">
                    <span className="student-task-icon-wrapper">
                      <Icon icon={todayTaskIcon(task.lessonType)} aria-hidden />
                    </span>
                    <span className="student-task-text">
                      <span className="student-task-title">{task.lessonTitle}</span>
                      <span className="student-task-meta">
                        {task.courseTitle}
                        {formatDeadline(task.deadline)
                          ? ` · до ${formatDeadline(task.deadline)}`
                          : ''}
                      </span>
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    readOnly
                    tabIndex={-1}
                    aria-label={
                      task.isCompleted ? 'Задание выполнено' : 'Задание не выполнено'
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
