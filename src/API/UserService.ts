import $api from "@/http";
import type { IUser } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import type { AxiosResponse } from "axios";

export default class AuthService {
    static async fetchGroupUsers(group_id : number): Promise<AxiosResponse<IUser[]>> {
        return $api.get<IUser[]>(`/groups/${group_id}/students`)
    }
}