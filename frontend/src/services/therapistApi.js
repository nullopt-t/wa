// services/therapistApi.js
import apiRequest from '../api.js';
import { getApiUrl } from '../config.js';

export const therapistAPI = {
  // Get full dashboard data
  getDashboard: () => apiRequest('/therapist/dashboard', {
    method: 'GET',
  }),

  // Get therapist stats only
  getStats: () => apiRequest('/therapist/stats', {
    method: 'GET',
  }),

  // Get therapist profile
  getProfile: () => apiRequest('/therapist/profile', {
    method: 'GET',
  }),

  // Update therapist profile
  updateProfile: (profileData) => apiRequest('/therapist/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  }),

  // Upload avatar
  uploadAvatar: (formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/therapist/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },
};

export default therapistAPI;
