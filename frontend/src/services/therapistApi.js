// services/therapistApi.js
import apiRequest from '../api.js';
import { API_URL } from '../config.js';

export const therapistAPI = {
  // Get full dashboard data
  getDashboard: () => apiRequest('/therapists/dashboard', {
    method: 'GET',
  }),

  // Get therapist profile
  getProfile: () => apiRequest('/therapists/profile/me', {
    method: 'GET',
  }),

  // Update therapist profile
  updateProfile: (profileData) => apiRequest('/therapists/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  }),
};

export default therapistAPI;
