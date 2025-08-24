import AuthService from "@/API/AuthService";
import type { IUser, RegData } from "@/models/IUser";
import AdminService  from "@/API/AdminService";
import {makeAutoObservable} from "mobx"
import axios from 'axios'
import { API_URL } from "@/http";
import { useCookies } from 'react-cookie';
import { Cookies } from "react-cookie";
import { Cog } from "lucide-react";
import type {Group, IGroup} from '../components/ui/interfaces/IGroup.tsx'
import type { IStudent } from "@/components/ui/interfaces/IStudent.tsx";

interface CookieSetOptions {
  path?: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
}

export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = true;
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
    setUser(user : IUser) {
        this.user = user;
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
    private authHandler(response) {
        console.log(response);
        
        if (response.status == 200 || response.status == 201 ) {
            this.setAuth(true);
            localStorage.setItem('token', response.data.access_token);
            this.setCookie('refresh', response.data.refresh_token);
        } else {
            this.logout()
        }
    }
    writeTokens(response) {
        this.setAuth(true);
        localStorage.setItem('token', response.data.access_token);
        this.setCookie('refresh', response.data.refresh_token);
    }
    private errorHandler(error) {
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
    async login(email : string, password : string) {
        try {
            const response = await AuthService.login(email, password).catch((e) => {
                console.log(response);
            });
            this.authHandler(response)
            console.log("my_cookie:  ", this.getCookie("refresh"));
            return response.status
        } catch(e) {
            console.log(e.response?.data?.message);
        }
    }

    async registration(regData: RegData) {
        const response = await AuthService.registration(regData).catch((e) => {
            this.errorHandler(e)
            return e.response
        })
        return response
    }
    logout() {
        this.setAuth(false);
        localStorage.removeItem('auth')
        localStorage.removeItem('token')
        this.removeCookie("refresh")
    }
    async refresh() {
        let refresh_token = this.getCookie("refresh")
        if (refresh_token) {
            const response = await AuthService.refresh(refresh_token)
            this.authHandler(response)
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
        const access_token = localStorage.getItem("token")
        if (access_token == null) {
            this.refresh() 
        }
        const response = await AdminService.getPending(access_token)
        return response
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
    async updateUser(id : number, user : IStudent) {
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
    async createGroup(group) {
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
}