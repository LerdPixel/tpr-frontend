import axios from "axios"

export default class PostService {
  static async getAll(limit = 10, page = 1) {
    const response = await axios.get('/placeholder/posts', {
      params : {
        _limit : limit,
        _page : page
      }
    });
    return response;
  }
  static async getById(id : string) {
    const response = await axios.get('/placeholder/posts/' + id);
    return response;
  }

  static async getCommentsByPostId(id : string) {
    const response = await axios.get('/placeholder/posts/' + id + '/comments/');
    return response;
  }
  static async getUsers() {
    const response = await axios.get('/placeholder/users/');
    return response;
  }
}