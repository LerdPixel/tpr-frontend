import AuthService from "@/API/AuthService";
import type { IUser, RegData } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import {makeAutoObservable} from "mobx"
import axios from 'axios'
import { API_URL } from "@/http";
import { useCookies } from 'react-cookie';
import { Cookies } from "react-cookie";

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
    private authHendler(response) {
        console.log(response)
        if (response.status == 200) {
            this.setAuth(true);
            localStorage.setItem('token', response.data.access_token);
            this.setCookie('refresh', response.data.refresh_token);
        }        
    }
    async login(email : string, password : string) {
        try {
            const response = await AuthService.login(email, password).catch((e) => {
                console.log(response);
            });
            this.authHendler(response)
            console.log("my_cookie:  ", this.getCookie("refresh"));
            return response.status
        } catch(e) {
            console.log(e.response?.data?.message);
        }
    }

    async registration(regData: RegData) {
        try {
            const response = await AuthService.registration(regData).catch((e) => {
                console.log(response);
            });
            this.authHendler(response)
        } catch(e) {
            console.log(e.response?.data?.message);
        }
    }
    logout() {
        this.setAuth(false);
        localStorage.removeItem('auth')
        this.removeCookie("refresh")
    }
    async refresh() {
        let refresh_token = this.getCookie("refresh")
        if (refresh_token) {
            const response = await AuthService.refresh(refresh_token)
            this.authHendler(response)
        }
    }
    async getGroupList() {
        try {
            const response = await AuthService.groupList()
            return response
        } catch (e) {
            console.log(e.response?.data?.message);            
        }
    }
}