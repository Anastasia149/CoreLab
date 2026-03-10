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
  materials: Material[];
  course_id: number;
  module_id: number | null;
}

export interface Module {
  id: number;
  title: string;
  lessons: Lesson[];
}

export interface CourseDetails {
  id: number;
  title: string;
  description: string;
  modules: Module[];
  lessons: Lesson[];
  status: 'draft' | 'published';
  price: number;
  image_url: string | null;
}
