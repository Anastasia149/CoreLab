import { makeAutoObservable } from "mobx";
import { IUser } from "../models/IUser";
import AuthService from "../services/AuthService";
import $api from "../http";
import { AuthResponse } from '../models/response/AuthResponse';

import { ICourse } from "../models/ICourse";
import { ICourseGrade } from "../models/ICourseGrade";
import { ICourseReview, ICourseReviewsResponse } from "../models/ICourseReview";
import { ISearchDetails, Module, Material, Lesson } from "../models/ICourseDetail";
import { ICourseStudent } from "../models/ICourseStudent";

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = false;
    courses = [] as ICourse[];
    theme: AppTheme = 'light';

    constructor() {
        makeAutoObservable(this);
        this.initTheme();
    }

    initTheme() {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            this.theme = saved;
        }
        this.applyTheme();
    }

    setTheme(theme: AppTheme) {
        this.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        this.applyTheme();
    }

    toggleTheme() {
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setLoading(bool: boolean) {
        this.isLoading = bool;
    }

    setCourses(courses: ICourse[]) {
        this.courses = courses;
    }

    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            console.log("FULL ERROR:", e);
            throw e;
        }
    }

    async getLesson(lessonId: string): Promise<Lesson | undefined> {
        try {
            const response = await $api.get<Lesson>(`/lessons/${lessonId}`);
            console.log("store.getLesson response data:", response.data);
            console.log("response.data.type:", response.data.type);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async enrollCourse(courseId: number): Promise<void> {
        try {
            await $api.post(`/courses/${courseId}/enroll`);
            // Optionally, refresh user's courses or show a success message
            await this.checkAuth(); // Refresh user data to show new course in "My Courses"
        } catch (e) {
            console.log("FULL ERROR:", e);
            throw e;
        }
    }

    async refreshMyCourses(): Promise<void> {
        if (!this.isAuth || this.user?.role !== 'student') return;
        try {
            const response = await $api.get<ICourse[]>('/courses/my');
            this.setUser({ ...this.user, courses: response.data });
        } catch (e) {
            console.log('FULL ERROR:', e);
        }
    }

    async createLesson(
        courseId: string,
        moduleId: string | null,
        title: string,
        content: string,
        imageUrl: string | null,
        type: string,
        deadline: string | null = null
    ): Promise<Lesson | undefined> {
        try {
            const response = await $api.post<Lesson>(`/lessons`, {
                courseId,
                moduleId,
                title,
                content,
                imageUrl,
                type,
                deadline,
            });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async updateLesson(
        lessonId: string,
        title: string,
        content: string,
        moduleId: string | null,
        imageUrl: string | null,
        type: string,
        deadline: string | null = null
    ): Promise<Lesson | undefined> {
        try {
            const response = await $api.put<Lesson>(`/lessons/${lessonId}`, {
                title,
                content,
                moduleId,
                imageUrl,
                type,
                deadline,
            });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async uploadLessonMaterial(lessonId: number, file: File): Promise<Material | undefined> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await $api.post<Material>(`/lessons/${lessonId}/materials`, formData);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async deleteLessonMaterial(materialId: number): Promise<void> {
        try {
            await $api.delete(`/lessons/materials/${materialId}`);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async deleteLesson(lessonId: string): Promise<void> {
        try {
            await $api.delete(`/lessons/${lessonId}`);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async submitAssignment(
        lessonId: number,
        type: 'link' | 'file' | 'completed' | 'mixed',
        content: string,
        items?: Array<{ type: 'link' | 'file'; content: string; label?: string }>
    ) {
        try {
            const response = await $api.post('/submissions', { lessonId, type, content, items });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async submitTest(lessonId: number, answers: Record<string, string[]>) {
        try {
            const response = await $api.post('/submissions', {
                lessonId,
                type: 'test',
                answers,
            });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getLessonSubmissions(lessonId: string) {
        try {
            const response = await $api.get(`/lessons/${lessonId}/submissions`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getMySubmission(lessonId: string) {
        try {
            const response = await $api.get(`/lessons/${lessonId}/my-submission`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getMyCourseGrades(courseId: number): Promise<ICourseGrade[]> {
        try {
            const response = await $api.get<ICourseGrade[]>(`/courses/${courseId}/my-grades`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return [];
        }
    }

    async getCourseReviews(courseId: number): Promise<ICourseReviewsResponse | null> {
        try {
            const response = await $api.get<ICourseReviewsResponse>(`/courses/${courseId}/reviews`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return null;
        }
    }

    async getMyCourseReview(courseId: number): Promise<ICourseReview | null> {
        try {
            const response = await $api.get<ICourseReview | null>(`/courses/${courseId}/my-review`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return null;
        }
    }

    async saveMyCourseReview(
        courseId: number,
        rating: number,
        comment: string
    ): Promise<ICourseReview | null> {
        try {
            const response = await $api.put<ICourseReview>(`/courses/${courseId}/my-review`, {
                rating,
                comment: comment.trim() || null,
            });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
            throw e;
        }
    }

    async deleteMySubmission(lessonId: string): Promise<boolean> {
        try {
            await $api.delete(`/lessons/${lessonId}/my-submission`);
            return true;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return false;
        }
    }

    async updateSubmissionReview(
        submissionId: number,
        status: 'passed' | 'failed'
    ) {
        try {
            const response = await $api.patch(`/submissions/${submissionId}/review`, { status });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getTeacherCourses() {
        try {
            const response = await $api.get<ICourse[]>('/teacher/courses');
            this.setCourses(response.data);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getAllCourses() {
        try {
            const response = await $api.get<ICourse[]>('/courses');
            this.setCourses(response.data);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getCourseById(id: string): Promise<ICourse | undefined> {
        try {
            const response = await $api.get<ICourse>(`/courses/${id}`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getCourseDetails(id: number): Promise<ISearchDetails | undefined> {
        try {
            const response = await $api.get<ISearchDetails>(`/teacher/course/${id}`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async getCourseStudents(courseId: number): Promise<ICourseStudent[]> {
        try {
            const response = await $api.get<ICourseStudent[]>(`/teacher/course/${courseId}/students`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return [];
        }
    }

    async getCourseStudentProfile(
        courseId: number,
        studentId: number
    ): Promise<ICourseStudent | undefined> {
        try {
            const response = await $api.get<ICourseStudent>(
                `/teacher/course/${courseId}/students/${studentId}`
            );
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async removeStudentFromCourse(courseId: number, studentId: number): Promise<boolean> {
        try {
            await $api.delete(`/teacher/course/${courseId}/students/${studentId}`);
            return true;
        } catch (e) {
            console.log("FULL ERROR:", e);
            return false;
        }
    }

    async createCourse(title: string, description: string, status: string, image: File | null, price: number) {
        try {
            let image_url = '';
            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                const response = await $api.post<{ url: string }>('/upload', formData);
                image_url = response.data.url;
            }
            const response = await $api.post<ICourse>('/courses', { title, description, status, image_url, price });
            this.courses.push(response.data);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async updateCourse(id: number, title: string, description: string, status: string, image: File | null, price: number, existingImageUrl: string | null) {
        try {
            let image_url = existingImageUrl;
            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                const response = await $api.post<{ url: string }>('/upload', formData);
                image_url = response.data.url;
            }
            await $api.put(`/courses/${id}`, { title, description, status, image_url, price });
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async deleteCourse(id: number): Promise<void> {
        try {
            await $api.delete(`/courses/${id}`);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async createModule(courseId: string, title: string): Promise<Module | undefined> {
        try {
            const response = await $api.post<Module>(`/courses/${courseId}/modules`, { title });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async registration(name: string, email: string, password: string, role: 'student' | 'teacher') {
        try {
            const response = await AuthService.registration(name, email, password, role);
            console.log(response.data.message);
        } catch (e) {
            console.log("FULL ERROR:", e);
            throw e;
        }
    }

    async logout() {
        try {
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async deleteAccount() {
        await AuthService.deleteAccount();
        localStorage.removeItem('token');
        this.setAuth(false);
        this.setUser({} as IUser);
    }

    async checkAuth(){
        this.setLoading(true);
        try{
           const response = await $api.get<AuthResponse>('/refresh');
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch(e){
            console.log("FULL ERROR:", e);
        } finally{
            this.setLoading(false);
        }
    }

    async updateUserProfile(payload: {
        name: string;
        email: string;
        avatar: string | null;
        aboutMe?: string | null;
        certificates?: string | null;
        career?: string | null;
    }) {
        const body: Record<string, unknown> = {
            name: payload.name,
            email: payload.email,
            avatar: payload.avatar ?? null,
        };
        if (payload.aboutMe !== undefined) {
            body.aboutMe = payload.aboutMe;
        }
        if (payload.certificates !== undefined) {
            body.certificates = payload.certificates;
        }
        if (payload.career !== undefined) {
            body.career = payload.career;
        }
        const response = await $api.put<{ user: IUser }>('/users/profile', body);
        this.setUser(response.data.user);
    }
}
