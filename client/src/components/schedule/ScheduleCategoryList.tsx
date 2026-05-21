import React, { useMemo } from 'react';
import { ICourse } from '../../models/ICourse';
import { ScheduleEvent } from '../../types/scheduleEvent';
import { getCourseColor } from '../../utils/scheduleCourseColors';
import '../teacher/schedule/ScheduleCategoryList.css';

type Props = {
  courses: ICourse[];
  events: ScheduleEvent[];
};

const ScheduleCategoryList: React.FC<Props> = ({ courses, events }) => {
  const countByCourse = useMemo(() => {
    const map = new Map<number, number>();
    for (const ev of events) {
      map.set(ev.courseId, (map.get(ev.courseId) ?? 0) + 1);
    }
    return map;
  }, [events]);

  return (
    <div className="schedule-category-list">
      <div className="schedule-category-header">
        <h3 className="schedule-category-title">Курсы</h3>
      </div>
      <div className="schedule-category-items">
        {courses.length === 0 ? (
          <p className="schedule-category-empty">Нет курсов для категорий</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="schedule-category-item">
              <span
                className="schedule-category-color"
                style={{ background: getCourseColor(course.id) }}
                aria-hidden
              />
              <span className="schedule-category-name">{course.title}</span>
              <span className="schedule-category-count">{countByCourse.get(course.id) ?? 0}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleCategoryList;
