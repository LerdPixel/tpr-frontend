import $api from "@/http";
import type { AuthResponse } from "@/models/response/AuthResponse";
import type { AxiosResponse } from "axios";

export default class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/auth/login', {email, password})
    }
    static async registration(email: string, first_name: string, group_id: number, last_name: string, password: string, patronymic: string, role: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/auth/register', {email, password, first_name, group_id, last_name, patronymic, role})
    }
}