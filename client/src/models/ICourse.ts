export interface ICourse {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    status: 'draft' | 'published';
    price: number;
}
