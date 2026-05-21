import $api from "../http";
import { AuthResponse } from "../models/response/AuthResponse";
import { RegistrationResponse } from "../models/response/RegistrationResponse";

export default class AuthService{
    static async login(email: string, password: string){
        return $api.post<AuthResponse>('/login', {email, password})
    }

    static async registration(name: string, email: string, password: string, role: 'student' | 'teacher') {
        return $api.post<RegistrationResponse>('/registration', {name, email, password, role})
    }

    static async logout() {
        return $api.post<AuthResponse>('/logout')
    }

    static async deleteAccount() {
        return $api.delete<{ message: string }>('/users/account')
    }
}

