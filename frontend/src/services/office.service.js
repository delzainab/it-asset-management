import api from './api';

class OfficeService {
  async getAllOffices() {
    const response = await api.get('/offices');
    return response.data;
  }
}

const officeService = new OfficeService();
export default officeService;