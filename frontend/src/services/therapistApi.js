// services/therapistApi.js
import apiRequest from '../api.js';

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
    return fetch('http://localhost:4000/api/therapist/profile/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'حدث خطأ أثناء رفع الصورة');
        }
        return data;
      }
      return response;
    });
  },
};

export default therapistAPI;
