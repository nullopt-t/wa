import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsAPI, categoriesAPI } from '../services/communityApi.js';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import PostCard from '../components/community/PostCard.jsx';
import CreatePostModal from '../components/community/CreatePostModal.jsx';
import CommunitySidebar from '../components/community/CommunitySidebar.jsx';

const CommunityPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    category: '',
    sort: 'createdAt',
  });
  
  // AbortController for cancelling pending requests
  const abortControllerRef = useRef(null);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load posts when filters change (resets to page 1)
  useEffect(() => {
    loadPosts(1, true); // Reset posts when filters change
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPosts = async (page = 1, resetPosts = false) => {
    try {
      setLoading(true);
      console.log('=== LOAD POSTS ===');
      console.log('Page:', page, 'Reset:', resetPosts, 'Current posts:', posts.length);
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      const params = {
        page,
        limit: 20,
        ...(filters.category && { category: filters.category }),
        sort: filters.sort,
      };
      console.log('Request params:', params);

      const data = await postsAPI.getAll(params);
      console.log('Response:', data);
      
      // Update pagination info
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
      
      // Either replace posts (new filter) or append (load more)
      const newPosts = resetPosts ? data.posts : [...posts, ...data.posts];
      console.log('Setting posts:', newPosts.length, 'posts');
      setPosts(newPosts);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      showError(error.message || 'فشل تحميل المنشورات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    if (isCreating) return; // Prevent duplicate submissions
    
    try {
      setIsCreating(true);
      await postsAPI.create(postData);
      success('تم إنشاء المنشور بنجاح، سيتم مراجعته ونشره قريباً');
      setShowCreateModal(false);
      // Reload posts to refresh the feed
      loadPosts(1, true);
    } catch (error) {
      showError(error.message || 'فشل إنشاء المنشور');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالمنشورات');
      return;
    }

    try {
      await postsAPI.like(postId);
      // Optimistically update the UI without reloading all posts
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes?.includes(user.id);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== user.id)
              : [...(post.likes || []), user.id]
          };
        }
        return post;
      }));
    } catch (error) {
      showError(error.message || 'فشل الإعجاب بالمنشور');
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">المجتمع</h1>
              <p className="text-[var(--text-secondary)]">شارك تجاربك واحصل على الدعم من المجتمع</p>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                منشور جديد
              </button>
            )}
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AnimatedItem type="slideRight" delay={0.2}>
            <CommunitySidebar
              categories={categories}
              selectedCategory={filters.category}
              onSelectCategory={(categoryId) => setFilters({ ...filters, category: categoryId })}
              onClearFilters={() => setFilters({ category: '', sort: 'createdAt' })}
            />
          </AnimatedItem>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
              </div>
            ) : posts.length === 0 ? (
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                  <i className="fas fa-newspaper text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد منشورات بعد</h3>
                  <p className="text-[var(--text-secondary)] mb-6">كن أول من ينشر منشوراً في المجتمع</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                    >
                      <i className="fas fa-plus ml-2"></i>
                      إنشاء منشور
                    </button>
                  )}
                </div>
              </AnimatedItem>
            ) : (
              <div className="space-y-6">
                {console.log('Rendering posts:', posts.length)}
                {posts.map((post, index) => (
                  <AnimatedItem key={post._id} type="slideUp" delay={index * 0.1}>
                    <PostCard
                      post={post}
                      onLike={() => handleLikePost(post._id)}
                      isAuthenticated={isAuthenticated}
                    />
                  </AnimatedItem>
                ))}
              </div>
            )}

            {/* Load More - Only show if there are more pages */}
            {!loading && posts.length > 0 && pagination.currentPage < pagination.totalPages && (
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="flex justify-center mt-8">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadPosts(pagination.currentPage + 1, false);
                    }}
                    className="px-8 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    تحميل المزيد
                  </button>
                </div>
              </AnimatedItem>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default CommunityPage;
