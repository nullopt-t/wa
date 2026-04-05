import { apiRequest } from '../api.js';

export const medicalContactsAPI = {
  // Public: get all active contacts
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    const queryString = query.toString();
    return apiRequest(`/medical-contacts${queryString ? `?${queryString}` : ''}`);
  },

  // Admin: get all contacts with pagination
  getAllAdmin: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);
    const queryString = query.toString();
    return apiRequest(`/medical-contacts/admin${queryString ? `?${queryString}` : ''}`);
  },

  // Admin: get stats
  getStats: () => apiRequest('/medical-contacts/admin/stats'),

  // Admin: get by ID
  getById: (id) => apiRequest(`/medical-contacts/admin/${id}`),

  // Admin: create
  create: (data) => apiRequest('/medical-contacts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin: update
  update: (id, data) => apiRequest(`/medical-contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Admin: delete
  delete: (id) => apiRequest(`/medical-contacts/${id}`, {
    method: 'DELETE',
  }),
};

export default medicalContactsAPI;
