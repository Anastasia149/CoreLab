export interface IUser{
    email: string;
    isActivated: boolean;
    id: string;
    role: 'student' | 'teacher';
    name: string;
}
