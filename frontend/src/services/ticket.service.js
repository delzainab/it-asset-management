import api from './api';

class TicketService {
  // ========== READ ==========
  async getAllTickets() {
    const response = await api.get('/tickets');
    return response.data;
  }

  async getOpenTickets() {
    const response = await api.get('/tickets/open');
    return response.data;
  }

  async getTicketById(id) {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  }

  // ========== CREATE ==========
  async createTicket(data) {
    const response = await api.post('/tickets', data);
    return response.data;
  }

  // ========== UPDATE ==========
  async updateTicket(id, data) {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  }

  async updateStatus(id, status) {
    const response = await api.put(`/tickets/${id}/status`, { status });
    return response.data;
  }

  async assignTicket(id, technicianId) {
    const response = await api.put(`/tickets/${id}/assign`, { technicianId });
    return response.data;
  }

  // ========== DELETE ==========
  async deleteTicket(id) {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
  }

  // ========== COMMENTS ==========
  async addComment(id, message) {
    const response = await api.post(`/tickets/${id}/comments`, { message });
    return response.data;
  }

  async getComments(id) {
    const response = await api.get(`/tickets/${id}/comments`);
    return response.data;
  }
}

const ticketService = new TicketService();
export default ticketService;