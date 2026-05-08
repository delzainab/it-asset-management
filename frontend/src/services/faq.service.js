import api from './api';

class FaqService {
  async getAllArticles() {
    const response = await api.get('/faq');
    return response.data;
  }

  async searchArticles(keyword) {
    const response = await api.get(`/faq/search?keyword=${keyword}`);
    return response.data;
  }

  async getArticleById(id) {
    const response = await api.get(`/faq/${id}`);
    return response.data;
  }

  async createArticle(data) {
    const response = await api.post('/faq', data);
    return response.data;
  }

  async updateArticle(id, data) {
    const response = await api.put(`/faq/${id}`, data);
    return response.data;
  }

  async deleteArticle(id) {
    const response = await api.delete(`/faq/${id}`);
    return response.data;
  }
}

const faqService = new FaqService();
export default faqService;