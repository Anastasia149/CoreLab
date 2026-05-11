import type { ISearchDetails } from '../models/ICourseDetail';

export function getTotalLessonsCount(course: ISearchDetails): number {
  if (typeof course.lessons_count === 'number' && !Number.isNaN(course.lessons_count)) {
    return course.lessons_count;
  }
  let n = 0;
  course.modules?.forEach((m) => {
    n += m.lessons?.length ?? 0;
  });
  n += course.lessons?.length ?? 0;
  return n;
}
