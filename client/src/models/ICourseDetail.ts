export interface Material {
  id: number;
  type: string;
  title: string;
  file_url: string;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  type: 'lecture' | 'assignment' | 'test';
  deadline?: string | null;
  materials: Material[];
  course_id: number;
  module_id: number | null;
  /** С курса, при GET /lessons/:id */
  author_name?: string | null;
  students_count?: number;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface ISearchDetails {
  id: number;
  title: string;
  description: string;
  category?: string | null;
  author_id?: number | null;
  author_name?: string | null;
  author_avatar?: string | null;
  author_about_me?: string | null;
  author_reviews_count?: number;
  author_average_rating?: number;
  modules: Module[];
  lessons: Lesson[];
  status: 'draft' | 'published';
  price: number | null;
  image_url: string | null;
  /** Всего уроков по курсу (с сервера или считается на клиенте) */
  lessons_count?: number;
  /** Записано студентов (с сервера) */
  students_count?: number;
}
