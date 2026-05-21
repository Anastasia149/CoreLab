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
}
