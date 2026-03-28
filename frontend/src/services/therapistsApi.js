import { apiRequest } from '../api.js';

export const therapistsAPI = {
  // Get all therapists (with filters)
  getAll: (params = '') => apiRequest(`/therapists${params ? `?${params}` : ''}`),

  // Get therapist by ID
  getById: (id) => apiRequest(`/therapists/${id}`),

  // Get own profile (therapist only)
  getOwnProfile: () => apiRequest('/therapists/profile/me'),

  // Create profile (therapist only)
  createProfile: (data) => apiRequest('/therapists/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Update profile (therapist only)
  updateProfile: (data) => apiRequest('/therapists/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Submit verification (therapist only)
  submitVerification: (licenseImage) => apiRequest('/therapists/profile/verify', {
    method: 'POST',
    body: JSON.stringify({ licenseImage }),
  }),

  // Get dashboard (therapist only)
  getDashboard: () => apiRequest('/therapists/dashboard'),

  // Get availability (therapist only)
  getAvailability: () => apiRequest('/therapists/availability'),

  // Update availability (therapist only)
  updateAvailability: (availability) => apiRequest('/therapists/availability', {
    method: 'PATCH',
    body: JSON.stringify({ availability }),
  }),

  // Delete profile (therapist only)
  deleteProfile: () => apiRequest('/therapists/profile', {
    method: 'DELETE',
  }),

  // Admin endpoints
  getAllForAdmin: (params = '') => apiRequest(`/therapists/admin/all${params ? `?${params}` : ''}`),

  verifyTherapist: (id) => apiRequest(`/therapists/${id}/verify`, {
    method: 'PATCH',
  }),

  approveTherapist: (id) => apiRequest(`/therapists/${id}/approve`, {
    method: 'PATCH',
  }),
};

export default therapistsAPI;
