import api from './api';

class AssetService {
  async getAllAssets() {
    const response = await api.get('/assets');
    return response.data;
  }

  async getAssetById(id) {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  }

  async createAsset(assetData) {
    const response = await api.post('/assets', assetData);
    return response.data;
  }

  async updateAsset(id, assetData) {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  }

  async deleteAsset(id) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await api.get('/assets/stats');
    return response.data;
  }

  async getWarrantyExpiring(days = 30) {
    const response = await api.get(`/assets/warranty-expiring?days=${days}`);
    return response.data;
  }
}

const assetService = new AssetService();
export default assetService;