import axios from 'axios'

export const API_URL = 'http://antonvz.ru:8080'

const $api = axios.create({
    withCredentials : true,
    baseURL : API_URL
})

$api.interceptors.request.use((config: any) => {
    if (config.headers) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
    }
    return config
})

export default $api;