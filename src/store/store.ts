import AuthService from "@/API/AuthService";
import type {RegData } from "@/models/IUser";
import AdminService  from "@/API/AdminService";
import {makeAutoObservable} from "mobx"
import axios from 'axios'
import { Cookies } from "react-cookie";
import type {IGroup} from '../components/ui/interfaces/IGroup.tsx'
import type { IPerson } from "../components/ui/interfaces/IPerson.tsx";

interface CookieSetOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
}
export const RoleFromId = (id : string): string => {
    if (id == '3')
        return "admin"
    if (id == '2')
        return "seminarist"
    if (id == '1')
        return "student"
    return ""
}
export default class Store {
    isAuth = false;
    isLoading = true;
    person: IPerson | null = null;
    role: string = "";
    private cookies: Cookies;
    constructor() {
        this.cookies = new Cookies();
        makeAutoObservable(this);
    }
    setLoading(bool: boolean) {
        this.isLoading = bool;
    }
    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setPerson(person: IPerson | null) {
        this.person = person;
    }

    setRole(role: string) {
        this.role = role;
    }

    getCookie(name: string): string | undefined {
        return this.cookies.get(name);
    }

    setCookie(name: string, value: any, options?: CookieSetOptions): void {
        this.cookies.set(name, value, { path: "/", ...options });
    }

    removeCookie(name: string, options?: CookieSetOptions): void {
        this.cookies.remove(name, { path: "/", ...options });
    }
    private async authHandler(response: any) {
        console.log(response);
        
        if (response.status == 200 || response.status == 201 ) {
            this.setAuth(true);
            localStorage.setItem('token', response.data.access_token);
            this.setCookie('refresh', response.data.refresh_token);
            // Fetch user info after successful authentication
            await this.getUserInfo();
        } else {
            this.logout()
        }
    }
    async writeTokens(response: any) {
        this.setAuth(true);
        localStorage.setItem('token', response.data.access_token);
        this.setCookie('refresh', response.data.refresh_token);
        // Fetch user info after writing tokens
        await this.getUserInfo();
    }
    private errorHandler(error: any) {
        console.log(error.response);
        if (error.response.status == 401) {
            console.log("HANDLER: 401");
            this.logout()
            return "unauthorized"
        }
        if (error.response.status == 404) {
            return "page not found"
        }
    }
    async getUserInfo() {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            await this.refresh() 
        }
        try {
            const response = await axios.get('/server/auth/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });
            
            if (response?.data) {
                this.setPerson(response.data as IPerson);
                const roleId = (response.data as any).roleID || (response.data as any).role_id;
                this.setRole(RoleFromId(roleId?.toString() || ""));
            }
            
            return response?.data
        } catch (e) {
            this.errorHandler(e);
            return null;
        }
    }
    async login(email : string, password : string) {
        try {
            const response = await AuthService.login(email, password);
            await this.authHandler(response);
            console.log("my_cookie:  ", this.getCookie("refresh"));
            return response.status;
        } catch(e: any) {
            console.log(e.response?.data?.message);
        }
    }

    async registration(regData: RegData) {
        try {
            const response = await AuthService.registration(regData);
            if (response && (response.status === 200 || response.status === 201)) {
                await this.authHandler(response);
            }
            return response;
        } catch (e: any) {
            this.errorHandler(e);
            return e.response;
        }
    }
    logout() {
        this.setAuth(false);
        this.setPerson(null);
        this.setRole("");
        localStorage.removeItem('auth')
        localStorage.removeItem('token')
        this.removeCookie("refresh")
    }
    async refresh() {
        let refresh_token = this.getCookie("refresh")
        if (refresh_token) {
            const response = await AuthService.refresh(refresh_token)
            await this.authHandler(response)
        }
        else {
            this.setAuth(false)
        }
    }
    async getGroupList() {
        const response = await AuthService.groupList().catch((e) => {
            return e.response
        })
        return response
    }
    async getPending() {
        let access_token = localStorage.getItem("token")
        if (access_token == null) {
            await this.refresh() 
            access_token = localStorage.getItem("token")
        }
        if (access_token) {
            const response = await AdminService.getPending(access_token)
            return response
        }
        return null
    }
    async approve(id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.patch(`/server/admin/users/${id}/approve`,
            null,
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async delete(id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.delete(`/server/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async getStudents(group_id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.get(`/server/groups/${group_id}/students`, {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async updateUser(id : number, user : IPerson) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.put(`/server/admin/users/${id}`, user, 
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async deleteGroup(group_id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.delete(`/server/admin/groups/${group_id}`, 
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async updateGroup(group : IGroup) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.put(`/server/admin/groups/${group.id}`, 
        group,
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async archiveGroup(group_id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.post(`/server/admin/groups/${group_id}/archive`, 
            null,
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async unArchiveGroup(group_id : number) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.post(`/server/admin/groups/${group_id}/unarchive`, 
            null,
        {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(this.errorHandler)
        return response
    }
    async createGroup(group: any) {
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await axios.post(`/server/admin/groups`, 
        group,
        {
            headers: { Authorization: `Bearer ${access_token}` },
            withCredentials: true
        }).catch(this.errorHandler)
        return response
    }
    async editUser(user : IPerson) {
        try {
            const access_token = localStorage.getItem("token");
            if (!access_token) throw new Error("Нет токена авторизации");

            const response = await axios.put(
                `/server/admin/users/${user.id}`,
                {
                    created_at: user.created_at,
                    email: user.email,
                    first_name: user.first_name,
                    group_id: Number(user.group_id),
                    id : user.id,
                    is_approved : user.is_approved,
                    last_name: user.last_name,
                    patronymic: user.patronymic,
                    role_id: Number(user.role_id),
                },
                {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Ошибка при обновлении пользователя", error);
            throw error;
        }
    }
}