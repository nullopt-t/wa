// services/journeyApi.js
import { apiRequest } from '../api.js';

export const journeyAPI = {
  // Get active journey
  getActive: () => apiRequest('/journey', { method: 'GET' }),

  // Get user's progress for the active journey
  getProgress: () => apiRequest('/journey/progress', {
    method: 'GET',
  }).catch((err) => {
    if (err.message && (err.message.includes('لم يتم بدء الرحلة') || err.message.includes('لم يتم بدء'))) return null;
    throw err;
  }),

  // Start the journey
  start: () => apiRequest('/journey/start', { method: 'POST' }),

  // Mark resource as completed
  completeResource: (levelNumber, resourceType, resourceId) =>
    apiRequest(`/journey/levels/${levelNumber}/complete-resource`, {
      method: 'POST',
      body: JSON.stringify({ resourceType, resourceId }),
    }),

  // Mark level as completed
  completeLevel: (levelNumber) =>
    apiRequest(`/journey/levels/${levelNumber}/complete`, { method: 'POST' }),

  // Admin
  create: (data) => apiRequest('/journey', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/journey/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/journey/${id}`, { method: 'DELETE' }),
  getAll: () => apiRequest('/journey/admin', { method: 'GET' }),
};
