export interface ICourseReview {
  id: number;
  course_id: number;
  student_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_avatar?: string | null;
}

export interface ICourseReviewsSummary {
  reviews_count: number;
  average_rating: number;
}

export interface ICourseReviewsResponse {
  summary: ICourseReviewsSummary;
  reviews: ICourseReview[];
}
