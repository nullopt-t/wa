// api.js
const API_BASE_URL = 'http://localhost:4000/api';

// Generic function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add JWT token to headers if available
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    // If response is not JSON, return as is
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        // Handle the new error format with error_code
        if (data && data.error_code) {
          // Dynamically import the error codes utility
          const errorCodesModule = await import('./utils/errorCodes.js');
          const userMessage = errorCodesModule.getUserFriendlyMessage(data.error_code);
          throw new Error(userMessage);
        } else {
          // Fallback for any other error format
          if (response.status === 400) {
            throw new Error('طلب غير صحيح، يرجى التحقق من البيانات المدخلة');
          } else if (response.status === 401) {
            throw new Error('غير مصرح بالوصول، يرجى تسجيل الدخول');
          } else if (response.status === 404) {
            throw new Error('الصفحة أو المورد المطلوب غير موجود');
          } else if (response.status === 409) {
            throw new Error('البريد الإلكتروني مستخدم مسبقاً، يرجى استخدام بريد إلكتروني آخر');
          } else if (response.status === 500) {
            throw new Error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً');
          } else {
            throw new Error('حدث خطأ أثناء معالجة الطلب');
          }
        }
      }
      return data;
    } else {
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً');
        } else {
          throw new Error('حدث خطأ أثناء معالجة الطلب');
        }
      }
      return response;
    }
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('خطأ في الاتصال بالشبكة، يرجى التحقق من اتصالك');
    }
    throw error;
  }
};

// Authentication API functions
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getProfile: () => apiRequest('/auth/profile', {
    method: 'GET',
  }),

  forgotPassword: (data) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  resetPassword: (data) => apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  refreshToken: (refreshToken) => apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }),

  verifyEmail: (token) => apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),

  resendVerificationEmail: (data) => apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Profile API functions
export const profileAPI = {
  getProfile: () => apiRequest('/auth/profile', {
    method: 'GET',
  }),

  updateProfile: (userId, userData) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  getUserById: (userId) => apiRequest(`/users/${userId}`, {
    method: 'GET',
  }),

  deleteAccount: (userId) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  }),

  changePassword: (passwordData) => apiRequest('/auth/change-password', {
    method: 'PATCH',
    body: JSON.stringify(passwordData),
  }),

  uploadAvatar: (userId, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`http://localhost:4000/api/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type - browser will set it automatically with boundary for FormData
      },
      body: formData,
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          if (data && data.error_code) {
            const errorCodesModule = await import('./utils/errorCodes.js');
            const userMessage = errorCodesModule.getUserFriendlyMessage(data.error_code);
            throw new Error(userMessage);
          }
          throw new Error(data.message || 'حدث خطأ أثناء رفع الصورة');
        }
        return data;
      }
      return response;
    }).catch(error => {
      console.error('Upload error:', error);
      throw error;
    });
  },

  updatePrivacySettings: (settings) => apiRequest('/auth/privacy-settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  }),
};

export default apiRequest;