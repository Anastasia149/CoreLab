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
  materials: Material[];
  course_id: number;
  module_id: number | null;
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
  author_name?: string | null;
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
