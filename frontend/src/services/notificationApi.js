import { apiRequest } from '../api.js';

export const notificationAPI = {
  // Get user notifications
  getAll: (page = 1, limit = 20, unreadOnly = false) => {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(unreadOnly && { unread: 'true' }),
    });
    return apiRequest(`/notifications?${params}`);
  },

  // Get unread count
  getUnreadCount: () => apiRequest('/notifications/unread/count'),

  // Mark as read
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'POST',
  }),

  // Mark all as read
  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'POST',
  }),

  // Delete notification
  delete: (id) => apiRequest(`/notifications/${id}`, {
    method: 'DELETE',
  }),
};

export default notificationAPI;
