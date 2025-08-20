import $api from "@/http";
import type { RegData } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import axios from "axios";

export default class AuthService {
    static async login(email: string, password: string) {
        const response = await axios.post('/api/auth/login', {email, password},  { withCredentials: true }).catch(function(error) {
          console.log(error.response.data);
        })
        console.log(response);
        
        return response
    }
    static async registration(regData : RegData) {
         const response = await axios.post('/api/auth/register', regData, { withCredentials: true })//.catch(function(error) {
        //   console.log(error.response.data);
        // })
        return response
    } //{regData.email, regData.first_name, regData.group_id, regData.last_name, regData.password, regData.patronymic, regData.role}
    static async refresh(refresh_token : string) {
        const response = await axios.post<AuthResponse>("/api/auth/refresh", {refresh_token}).catch((e) => {
            console.log(e.response.data);
        })
        return response
    }
    static async groupList() {
        const response = await axios.get("api/groups/")
        return response;
    }
}