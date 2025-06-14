import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

export const API_AUTH_URL = 'http://localhost:8080'

const $api = axios.create({
    withCredentials : true,
    baseURL : API_AUTH_URL
})

$api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    return config
})

export default $api;