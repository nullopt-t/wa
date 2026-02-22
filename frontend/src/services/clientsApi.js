// services/clientsApi.js
import { apiRequest } from '../api.js';

export const clientsAPI = {
  // Get all clients
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/clients${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single client
  getById: (id) => apiRequest(`/clients/${id}`, {
    method: 'GET',
  }),

  // Get client sessions
  getSessions: (id) => apiRequest(`/clients/${id}/sessions`, {
    method: 'GET',
  }),

  // Create new client
  create: (clientData) => apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  }),

  // Update client
  update: (id, clientData) => apiRequest(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(clientData),
  }),

  // Delete client
  delete: (id) => apiRequest(`/clients/${id}`, {
    method: 'DELETE',
  }),

  // Get client statistics
  getStatistics: () => apiRequest('/clients/statistics', {
    method: 'GET',
  }),
};

export default clientsAPI;
