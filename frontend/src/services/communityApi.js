// services/communityApi.js
import { apiRequest } from '../api.js';

// Categories API
export const categoriesAPI = {
  // Get all categories
  getAll: () => apiRequest('/community/categories', {
    method: 'GET',
  }),

  // Get single category
  getById: (id) => apiRequest(`/community/categories/${id}`, {
    method: 'GET',
  }),

  // Create category (admin)
  create: (categoryData) => apiRequest('/community/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),

  // Update category (admin)
  update: (id, categoryData) => apiRequest(`/community/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoryData),
  }),

  // Delete category (admin)
  delete: (id) => apiRequest(`/community/categories/${id}`, {
    method: 'DELETE',
  }),
};

// Posts API
export const postsAPI = {
  // Get all posts with filters
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/community/posts${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get trending posts
  getTrending: () => apiRequest('/community/posts/trending', {
    method: 'GET',
  }),

  // Search posts
  search: (query, page = 1) => apiRequest(`/community/posts/search?q=${query}&page=${page}`, {
    method: 'GET',
  }),

  // Get single post
  getById: (id) => apiRequest(`/community/posts/${id}`, {
    method: 'GET',
  }),

  // Create post
  create: (postData) => apiRequest('/community/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),

  // Update post
  update: (id, postData) => apiRequest(`/community/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(postData),
  }),

  // Delete post
  delete: (id) => apiRequest(`/community/posts/${id}`, {
    method: 'DELETE',
  }),

  // Like/Unlike post
  like: (id) => apiRequest(`/community/posts/${id}/like`, {
    method: 'POST',
  }),

  // Track view
  trackView: (id) => apiRequest(`/community/posts/${id}/view`, {
    method: 'POST',
  }),

  // Save/Unsave post
  save: (id) => apiRequest(`/community/posts/${id}/save`, {
    method: 'POST',
  }),

  // Get saved posts
  getSaved: (page = 1) => apiRequest(`/community/posts/saved/list?page=${page}`, {
    method: 'GET',
  }),
};

// Comments API
export const commentsAPI = {
  // Get comments for a post
  getByPost: (postId, page = 1) => apiRequest(`/community/comments/post/${postId}?page=${page}`, {
    method: 'GET',
  }),

  // Create comment
  create: (commentData) => apiRequest('/community/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),

  // Update comment
  update: (id, commentData) => apiRequest(`/community/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(commentData),
  }),

  // Delete comment
  delete: (id) => apiRequest(`/community/comments/${id}`, {
    method: 'DELETE',
  }),

  // Like/Unlike comment
  like: (id) => apiRequest(`/community/comments/${id}/like`, {
    method: 'POST',
  }),
};

// Reports API
export const reportsAPI = {
  // Create report
  create: (reportData) => apiRequest('/community/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  }),

  // Get reports for a target
  getForTarget: (targetType, targetId) => apiRequest(`/community/reports/target/${targetType}/${targetId}`, {
    method: 'GET',
  }),

  // Get all reports (admin)
  getAll: (page = 1, status) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    return apiRequest(`/community/reports?${params}`, {
      method: 'GET',
    });
  },

  // Update report (admin)
  update: (id, reportData) => apiRequest(`/community/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(reportData),
  }),

  // Get statistics (admin)
  getStatistics: () => apiRequest('/community/reports/stats/overview', {
    method: 'GET',
  }),
};

export default {
  categories: categoriesAPI,
  posts: postsAPI,
  comments: commentsAPI,
};
