import api from './api';

class MaintenanceService {
  async getAllMaintenances() {
    const response = await api.get('/maintenances');
    return response.data;
  }

  async getAssetMaintenances(assetId) {
    const response = await api.get(`/maintenances/asset/${assetId}`);
    return response.data;
  }

  async getPlannedMaintenances() {
    const response = await api.get('/maintenances/planned');
    return response.data;
  }

  async getInProgressMaintenances() {
    const response = await api.get('/maintenances/in-progress');
    return response.data;
  }

  async getMaintenanceById(id) {
    const response = await api.get(`/maintenances/${id}`);
    return response.data;
  }

  async createMaintenance(data) {
    const response = await api.post('/maintenances', data);
    return response.data;
  }

  async startMaintenance(id) {
    const response = await api.put(`/maintenances/${id}/start`);
    return response.data;
  }

  async completeMaintenance(id, actionsPerformed) {
    const response = await api.put(`/maintenances/${id}/complete`, { actionsPerformed });
    return response.data;
  }
}

const maintenanceService = new MaintenanceService();
export default maintenanceService;