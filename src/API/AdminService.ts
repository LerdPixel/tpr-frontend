import axios from "axios"

export default class AdminService {
    getAccessToken() {
        return localStorage.getItem('token');
    }
    static async getPending(access_token : string) {
        const response = await axios.get('/server/admin/users/pending', {
            headers: { Authorization: `Bearer ${access_token}` }
        }).catch(function(error) {
            return Promise.reject(error);
        })
        return response
    }

};