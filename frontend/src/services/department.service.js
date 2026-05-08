import api from './api';

class DepartmentService {
  async getAllDepartments() {
    const response = await api.get('/departments');
    return response.data;
  }

  async getDepartmentById(id) {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  }

  async createDepartment(data) {
    const response = await api.post('/departments', data);
    return response.data;
  }

  async updateDepartment(id, data) {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  }

  async deleteDepartment(id) {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
}

const departmentService = new DepartmentService();
export default departmentService;