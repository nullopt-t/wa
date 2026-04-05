import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsAPI } from '../services/communityApi.js';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import PostCard from '../components/community/PostCard.jsx';
import CreatePostModal from '../components/community/CreatePostModal.jsx';
import EditPostModal from '../components/community/EditPostModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import CommunitySidebar from '../components/community/CommunitySidebar.jsx';

// Custom animations for buttons
const customAnimations = `
  @keyframes bounce-subtle {
    0%, 100% {
      transform: translateY(0);
    }
    25% {
      transform: translateY(-3px);
    }
    75% {
      transform: translateY(3px);
    }
  }
  
  .animate-bounce-subtle {
    animation: bounce-subtle 1s ease-in-out infinite;
  }
`;

const CommunityPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    tag: '',
    sort: 'createdAt',
  });

  // AbortController for cancelling pending requests
  const abortControllerRef = useRef(null);
  // Debounce timer for filter changes
  const filterDebounceRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear any pending debounce
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
  }, []);

  // Load posts when filters change (resets to page 1) - with debouncing
  useEffect(() => {
    

    // Clear any pending debounce
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    // Debounce filter changes by 300ms to prevent rapid API calls
    filterDebounceRef.current = setTimeout(() => {
      
      loadPosts(1, true);
    }, 300);

    // Cleanup on unmount or filter change
    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
  }, [filters]);

  const loadPosts = async (page = 1, resetPosts = false) => {
    try {
      setLoading(true);
      
      
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      const params = {
        page,
        limit: 20,
        ...(filters.tag && { tag: filters.tag }),
        sort: filters.sort,
      };
      

      const data = await postsAPI.getAll(params);
      
      // Handle empty response from API
      if (!data || !data.posts) {
        console.warn('API returned no posts');
        setPosts([]);
        setPagination({ currentPage: 1, totalPages: 1, total: 0 });
        setLoading(false);
        return;
      }
      
      // Update pagination info
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      });
      
      // Either replace posts (new filter) or append (load more)
      const newPosts = resetPosts ? (data.posts || []) : [...posts, ...(data.posts || [])];
      
      setPosts(newPosts);
    } catch (error) {
      if (error.name === 'AbortError') {
        
        return;
      }
      console.error('Failed to load posts:', error);
      // Don't show error to user - just show empty state
      setPosts([]);
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
      // Clear any pending filter debounce
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
      // Reload posts to refresh the feed
      await loadPosts(1, true);
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
      const result = await postsAPI.like(postId);
      
      
      // Update the post with the returned likes array from server
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: result.likes || [],
          };
        }
        return post;
      }));
      
    } catch (error) {
      
      showError(error.message || 'فشل الإعجاب بالمنشور');
    }
  };

  const handleSavePost = async (postId) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول لحفظ المنشورات');
      return;
    }

    try {
      const result = await postsAPI.save(postId);
      // Update the post with the returned savedBy array from server
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            savedBy: result.savedBy || [],
          };
        }
        return post;
      }));
    } catch (error) {
      showError(error.message || 'فشل حفظ المنشور');
    }
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setShowEditModal(true);
  };

  const handleUpdatePost = async (updateData) => {
    if (!postToEdit) return;

    try {
      await postsAPI.update(postToEdit._id, updateData);
      success('تم تعديل المنشور بنجاح');
      setShowEditModal(false);
      setPostToEdit(null);
      // Reload posts to get updated data
      await loadPosts(1, true);
    } catch (error) {
      showError(error.message || 'فشل تعديل المنشور');
    }
  };

  const handleDeletePostClick = (post) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await postsAPI.delete(postToDelete._id);
      success('تم حذف المنشور بنجاح');
      setShowDeleteDialog(false);
      setPostToDelete(null);
      // Reload posts
      await loadPosts(1, true);
    } catch (error) {
      showError(error.message || 'فشل حذف المنشور');
    }
  };

  const handleClearTagFilter = () => {
    setFilters({ ...filters, tag: '' });
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-4 md:py-8">
      {/* Custom Animations Styles */}
      <style>{customAnimations}</style>

      <div className="max-w-7xl mx-auto px-3 md:px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">المجتمع</h1>
              <p className="text-sm md:text-base text-[var(--text-secondary)]">شارك تجاربك واحصل على الدعم من المجتمع</p>
            </div>

            {isAuthenticated && user?.role !== 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto px-4 md:px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i>
                <span className="hidden sm:inline">منشور جديد</span>
                <span className="sm:hidden">جديد</span>
              </button>
            )}
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar - Hidden on mobile, slides in on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <AnimatedItem type="slideRight" delay={0.2}>
              <CommunitySidebar
                selectedTag={filters.tag}
                onSelectTag={(tag) => setFilters({ ...filters, tag })}
                onClearTagFilter={handleClearTagFilter}
              />
            </AnimatedItem>
          </div>

          {/* Mobile Filter Bar - Trending Tags - REMOVED */}

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12 md:py-20">
                <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
              </div>
            ) : !posts || posts.length === 0 ? (
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)]/30">
                  <i className="fas fa-newspaper text-5xl md:text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2">لا توجد منشورات بعد</h3>
                  <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6">كن أول من ينشر منشوراً في المجتمع</p>
                  {isAuthenticated && user?.role !== 'admin' && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full md:w-auto px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
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
                      onSave={() => handleSavePost(post._id)}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePostClick(post)}
                      isAuthenticated={isAuthenticated}
                      isAdmin={user?.role === 'admin'}
                    />
                  </AnimatedItem>
                ))}
              </div>
            )}

            {/* Load More - Only show if there are more pages */}
            {!loading && posts && posts.length > 0 && pagination.currentPage < pagination.totalPages && (
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="flex justify-center mt-6 md:mt-8">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadPosts(pagination.currentPage + 1, false);
                    }}
                    className="w-full md:w-auto px-6 md:px-8 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
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
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Edit Post Modal */}
      {showEditModal && postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={() => {
            setShowEditModal(false);
            setPostToEdit(null);
          }}
          onSubmit={handleUpdatePost}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && postToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="حذف المنشور"
          message="هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
          confirmText="حذف"
          cancelText="إلغاء"
          isDanger={true}
          onConfirm={handleDeletePost}
          onCancel={() => {
            setShowDeleteDialog(false);
            setPostToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default CommunityPage;
