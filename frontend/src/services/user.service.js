import api from './api';

class UserService {
  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data) {
    console.log('Création utilisateur:', data);
    const response = await api.post('/users', data);
    return response.data;
  }

  async updateUser(id, data) {
    console.log('Mise à jour utilisateur ID:', id, data);
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}

const userService = new UserService();
export default userService;