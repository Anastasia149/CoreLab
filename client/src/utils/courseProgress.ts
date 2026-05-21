export type CourseProgressSource = {
  lessons_count?: number;
  gradable_lessons_count?: number;
  completed_lessons?: number;
};

export function getCourseProgressTotals(course: CourseProgressSource): {
  completed: number;
  total: number;
  percent: number;
} {
  const completed = Number(course.completed_lessons) || 0;
  const gradable = Number(course.gradable_lessons_count) || 0;
  const allLessons = Number(course.lessons_count) || 0;
  const total = gradable > 0 ? gradable : allLessons;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}
