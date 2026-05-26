export type LessonCommentMessage = {
  id: number;
  lessonId: number;
  studentId: number;
  authorRole: 'student' | 'teacher';
  body: string;
  createdAt: string;
};

export type LessonCommentThread = {
  studentId: number;
  studentName: string;
  messages: LessonCommentMessage[];
};

export type MyLessonCommentThread = {
  messages: LessonCommentMessage[];
};

export type LessonCommentThreadsResponse = {
  threads: LessonCommentThread[];
};
