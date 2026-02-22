// services/sessionsApi.js
import { apiRequest } from '../api.js';

export const sessionsAPI = {
  // Get all sessions with filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/sessions${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single session
  getById: (id) => apiRequest(`/sessions/${id}`, {
    method: 'GET',
  }),

  // Get today's sessions
  getToday: () => apiRequest('/sessions/today', {
    method: 'GET',
  }),

  // Get upcoming sessions
  getUpcoming: () => apiRequest('/sessions/upcoming', {
    method: 'GET',
  }),

  // Get sessions for a specific client
  getByClient: (clientId) => apiRequest(`/sessions/client/${clientId}`, {
    method: 'GET',
  }),

  // Create new session
  create: (sessionData) => apiRequest('/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  }),

  // Update session
  update: (id, sessionData) => apiRequest(`/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(sessionData),
  }),

  // Cancel session
  cancel: (id, reason) => apiRequest(`/sessions/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  }),

  // Complete session
  complete: (id, data) => apiRequest(`/sessions/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Delete session
  delete: (id) => apiRequest(`/sessions/${id}`, {
    method: 'DELETE',
  }),

  // Get session statistics
  getStatistics: () => apiRequest('/sessions/statistics', {
    method: 'GET',
  }),
};

export default sessionsAPI;
