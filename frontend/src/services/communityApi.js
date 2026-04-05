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

  // Get trending tags
  getTrendingTags: (limit = 10) => apiRequest(`/community/posts/trending/tags?limit=${limit}`, {
    method: 'GET',
  }),
};

// Comments API
export const commentsAPI = {
  // Get comments for a post
  getByPost: (postId, page = 1) => apiRequest(`/comments/post/${postId}?page=${page}`, {
    method: 'GET',
  }),

  // Create comment
  create: (commentData) => apiRequest('/comments', {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),

  // Update comment
  update: (id, commentData, postId) => apiRequest(`/comments/${id}${postId ? `?postId=${postId}` : ''}`, {
    method: 'PATCH',
    body: JSON.stringify(commentData),
  }),

  // Delete comment
  delete: (id) => apiRequest(`/comments/${id}`, {
    method: 'DELETE',
  }),

  // Like/Unlike comment
  like: (id) => apiRequest(`/comments/${id}/like`, {
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

// Stories API
export const storiesAPI = {
  // Get all stories
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stories${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get single story
  getById: (id) => apiRequest(`/stories/${id}`, {
    method: 'GET',
  }),

  // Create story
  create: (storyData) => apiRequest('/stories', {
    method: 'POST',
    body: JSON.stringify(storyData),
  }),

  // Update story
  update: (id, storyData) => apiRequest(`/stories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(storyData),
  }),

  // Delete story
  delete: (id) => apiRequest(`/stories/${id}`, {
    method: 'DELETE',
  }),

  // Get user's stories
  getByUser: (userId, page = 1) => apiRequest(`/stories/user/${userId}?page=${page}`, {
    method: 'GET',
  }),

  // Like/Unlike story
  like: (id) => apiRequest(`/stories/${id}/like`, {
    method: 'POST',
  }),

  // Save/Unsave story
  save: (id) => apiRequest(`/stories/${id}/save`, {
    method: 'POST',
  }),

  // Get saved stories
  getSaved: (page = 1) => apiRequest(`/stories/saved/list?page=${page}`, {
    method: 'GET',
  }),

  // Admin: Get all stories
  getAllForAdmin: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stories/admin/all${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Admin: Get story stats
  getStats: () => apiRequest('/stories/admin/stats', {
    method: 'GET',
  }),

  // Admin: Moderate story
  moderate: (id, status) => apiRequest(`/stories/admin/${id}/moderate?status=${status}`, {
    method: 'PATCH',
  }),

  // Admin: Get statistics
  getStats: () => apiRequest('/stories/admin/stats', {
    method: 'GET',
  }),
};

export default {
  categories: categoriesAPI,
  posts: postsAPI,
  comments: commentsAPI,
  reports: reportsAPI,
  stories: storiesAPI,
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getById: (id) => apiRequest(`/users/${id}`, {
    method: 'GET',
  }),

  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),

  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Videos API
export const videosAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/videos${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getFeatured: (limit = 6) => apiRequest(`/videos/featured?limit=${limit}`, {
    method: 'GET',
  }),

  getById: (id) => apiRequest(`/videos/${id}`, {
    method: 'GET',
  }),

  create: (videoData) => apiRequest('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  }),

  update: (id, videoData) => apiRequest(`/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(videoData),
  }),

  delete: (id) => apiRequest(`/videos/${id}`, {
    method: 'DELETE',
  }),

  getAllForAdmin: (params = {}) => apiRequest(`/videos/admin/all?${new URLSearchParams(params).toString()}`, {
    method: 'GET',
  }),
};

// Books API
export const booksAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/books${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getFeatured: (limit = 6) => apiRequest(`/books/featured?limit=${limit}`, {
    method: 'GET',
  }),

  getBySlug: (slug) => apiRequest(`/books/slug/${slug}`, {
    method: 'GET',
  }),

  getById: (id) => apiRequest(`/books/${id}`, {
    method: 'GET',
  }),

  create: (bookData) => apiRequest('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  }),

  update: (id, bookData) => apiRequest(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bookData),
  }),

  delete: (id) => apiRequest(`/books/${id}`, {
    method: 'DELETE',
  }),

  getAllForAdmin: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/books/admin/all?${queryString}`, {
      method: 'GET',
    });
  },
};

// Future Messages API
export const futureMessagesAPI = {
  getAll: (includeDelivered = false) => apiRequest(`/future-messages?includeDelivered=${includeDelivered}`, {
    method: 'GET',
  }),

  getById: (id) => apiRequest(`/future-messages/${id}`, {
    method: 'GET',
  }),

  create: (messageData) => apiRequest('/future-messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),

  update: (id, messageData) => apiRequest(`/future-messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(messageData),
  }),

  delete: (id) => apiRequest(`/future-messages/${id}`, {
    method: 'DELETE',
  }),
};

// Articles API
export const articlesAPI = {
  // Get all articles
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/articles${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get featured articles
  getFeatured: (limit = 3) => apiRequest(`/articles/featured?limit=${limit}`, {
    method: 'GET',
  }),

  // Get article by slug
  getBySlug: (slug) => apiRequest(`/articles/slug/${slug}`, {
    method: 'GET',
  }),

  // Get single article
  getById: (id) => apiRequest(`/articles/${id}`, {
    method: 'GET',
  }),

  // Create article
  create: (articleData) => apiRequest('/articles', {
    method: 'POST',
    body: JSON.stringify(articleData),
  }),

  // Update article
  update: (id, articleData) => apiRequest(`/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(articleData),
  }),

  // Delete article
  delete: (id) => apiRequest(`/articles/${id}`, {
    method: 'DELETE',
  }),

  // Like article
  like: (id) => apiRequest(`/articles/${id}/like`, {
    method: 'POST',
  }),
};

// Settings API (Admin)
export const settingsAPI = {
  get: () => apiRequest('/admin/settings', {
    method: 'GET',
  }),

  update: (settingsData) => apiRequest('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settingsData),
  }),
};
