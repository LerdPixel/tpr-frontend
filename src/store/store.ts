import AuthService from "@/API/AuthService";
import type { IUser, RegData } from "@/models/IUser";
import type { AuthResponse } from "@/models/response/AuthResponse";
import {makeAutoObservable} from "mobx"
import axios from 'axios'
import { API_URL } from "@/http";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    isLoading = true;
    
    constructor() {
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

    async login(email : string, password : string) {
        try {
            const response = await AuthService.login(email, password);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('ref_token', response.data.refreshToken);
            this.setAuth(true);
            //this.setUser(response.data.user);
        } catch(e) {
            console.log(e.response?.data?.message);
        }
    }
    async registration(regData: RegData) {
        try {
            const response = await AuthService.registration(regData);
            console.log(response)
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('ref_token', response.data.refreshToken);
            this.setAuth(true);
            //this.setUser(response.data.user);
        } catch(e) {
            console.log(e.response?.data?.message);
        }
    }
    logout() {
        try {
            //const response = await AuthService.login(email, password);
            //console.log(response)
            this.setAuth(false);
            localStorage.removeItem('auth')
            console.log("logouting");
            
            //this.setUser(response.data.user);
        } catch(e) {
            //console.log(e.response?.data?.message);
        }
    }
    async checkAuth() {
        if (localStorage.getItem("ref_token")) {
            console.log("ref_token " + localStorage.getItem("ref_token"));
            
            try {
                const response = await AuthService.refresh(localStorage.getItem("ref_token"))
                localStorage.setItem('token', response.data.accessToken);
                this.setAuth(true);
            } catch (e) {
                console.log(e.response?.data?.message);            
            }
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