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

export default {
  categories: categoriesAPI,
  posts: postsAPI,
  comments: commentsAPI,
};
