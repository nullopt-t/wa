import { apiRequest } from '../api.js';

export const feedbackAPI = {
  // Submit feedback
  submit: (feedbackData) => apiRequest('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  }),

  // Get public feedback (approved reviews)
  getPublic: (page = 1, limit = 10) => 
    apiRequest(`/feedback/public?page=${page}&limit=${limit}`),

  // Get user's own feedback
  getMyFeedback: (page = 1, limit = 10) => 
    apiRequest(`/feedback/my-feedback?page=${page}&limit=${limit}`),

  // Admin: Get all feedback
  getAll: (page = 1, limit = 20, status, category) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    return apiRequest(`/feedback/admin?${params}`);
  },

  // Admin: Get statistics
  getStatistics: () => apiRequest('/feedback/admin/stats'),

  // Admin: Update status
  updateStatus: (id, statusData) => apiRequest(`/feedback/admin/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  }),

  // Admin: Delete feedback
  delete: (id) => apiRequest(`/feedback/admin/${id}`, {
    method: 'DELETE',
  }),
};

export default feedbackAPI;
