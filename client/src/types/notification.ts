export type NotificationItem = {
  id: string;
  icon: string;
  message: string;
  timeAgo: string;
  courseId?: number | null;
  lessonId?: number | null;
  isRead?: boolean;
};
