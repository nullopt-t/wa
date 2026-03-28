// services/therapistApi.js
import apiRequest from '../api.js';
import { API_URL } from '../config.js';

export const therapistAPI = {
  // Get full dashboard data
  getDashboard: () => apiRequest('/therapists/dashboard', {
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
    return fetch(`${API_URL}/therapist/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },
};

export default therapistAPI;
