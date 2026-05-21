export interface ICourseGrade {
  lesson_id: number;
  lesson_title: string;
  lesson_type: string;
  submission_id: number | null;
  review_status: string | null;
  submitted_at: string | null;
  is_overdue?: boolean;
}
