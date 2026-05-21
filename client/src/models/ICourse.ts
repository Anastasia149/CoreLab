export interface ICourse {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    status: 'draft' | 'published';
    price: number;
    author_id: number;
    author_name?: string;
    author_avatar?: string | null;
    students_count?: number;
    lessons_count?: number;
    /** Задания и тесты, по которым считается прогресс */
    gradable_lessons_count?: number;
    /** Уроки с проверкой «Сдал» */
    completed_lessons?: number;
}
