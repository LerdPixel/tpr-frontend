import $api from "@/http";
import type { RegData } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import axios from "axios";

export default class AuthService {
    static async login(email: string, password: string) {
        try {
            const response = await axios.post('/server/auth/login', {email, password},  { withCredentials: true });
            console.log(response);
            return response;
        } catch (error: any) {
            console.log(error.response?.data);
            throw error;
        }
    }
    static async registration(regData : RegData) {
         const response = await axios.post('/server/auth/register', regData, { withCredentials: true })//.catch(function(error) {
        //   console.log(error.response.data);
        // })
        return response
    } //{regData.email, regData.first_name, regData.group_id, regData.last_name, regData.password, regData.patronymic, regData.role}
    static async refresh(refresh_token : string) {
        const response = await axios.post<AuthResponse>("/server/auth/refresh", {refresh_token}).catch((e) => {
            return Promise.reject(e);
        })
        return response
    }
    static async groupList() {
        const response = await axios.get("/server/groups")
        return response;
    }
}