import { makeAutoObservable } from "mobx";
import { IUser } from "../models/IUser";
import AuthService from "../services/AuthService";
import $api from "../http";
import { AuthResponse } from '../models/response/AuthResponse';

import { ICourse } from "../models/ICourse";
import { CourseDetails, Module, Material, Lesson } from "../models/ICourseDetail";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = false;
    courses = [] as ICourse[];

    constructor() {
        makeAutoObservable(this);
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
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async createLesson(courseId: string, moduleId: string | null, title: string, content: string, imageUrl: string | null): Promise<Lesson | undefined> {
        try {
            const response = await $api.post<Lesson>(`/lessons`, { courseId, moduleId, title, content, imageUrl });
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
        }
    }

    async updateLesson(lessonId: string, title: string, content: string, moduleId: string | null, imageUrl: string | null): Promise<Lesson | undefined> {
        try {
            const response = await $api.put<Lesson>(`/lessons/${lessonId}`, { title, content, moduleId, imageUrl });
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

    async getCourseDetails(id: number): Promise<CourseDetails | undefined> {
        try {
            const response = await $api.get<CourseDetails>(`/teacher/course/${id}`);
            return response.data;
        } catch (e) {
            console.log("FULL ERROR:", e);
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
}
