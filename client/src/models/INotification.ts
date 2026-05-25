export type NotificationDto = {
  id: number;
  type: string;
  message: string;
  courseId: number | null;
  lessonId: number | null;
  isRead: boolean;
  createdAt: string;
  icon: string;
};

export type NotificationsResponse = {
  items: NotificationDto[];
  unreadCount: number;
};
