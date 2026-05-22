export interface IStudentTodayTask {
  lessonId: number;
  lessonTitle: string;
  lessonType: 'assignment' | 'test';
  deadline: string;
  courseId: number;
  courseTitle: string;
  isCompleted: boolean;
}
