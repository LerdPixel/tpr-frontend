import $api from "@/http";
import type { AuthResponse } from "@/models/response/AuthResponse";
import axios from "axios";

export default class AuthService {
    static async login(email: string, password: string) {
        const response = await axios.post('/api/auth/login', {email, password},  { withCredentials: true });
        return response
    }
    static async registration(email: string, first_name: string, group_id: number, last_name: string, password: string, patronymic: string, role: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/register', {email, password, first_name, group_id, last_name, patronymic, role})
    }
    static async refresh(refresh_token : string) {
        const response = await axios.get("/api/auth/refresh", {
            params : {
                "refresh_token" : refresh_token
            }
        })
        return response
    }
    static async groupList() {
        const response = await axios.get("api/groups/")
        return response;
    }
}