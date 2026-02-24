import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsAPI, categoriesAPI } from '../services/communityApi.js';
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
  const [categories, setCategories] = useState([]);
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
    category: '',
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

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load posts when filters change (resets to page 1) - with debouncing
  useEffect(() => {
    console.log('Filters changed:', filters);
    
    // Clear any pending debounce
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    // Debounce filter changes by 300ms to prevent rapid API calls
    filterDebounceRef.current = setTimeout(() => {
      console.log('Loading posts with filters:', filters);
      loadPosts(1, true);
    }, 300);

    // Cleanup on unmount or filter change
    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current);
      }
    };
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
        ...(filters.tag && { tag: filters.tag }),
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
    console.log('handleLikePost called:', { postId, isAuthenticated });
    
    if (!isAuthenticated) {
      console.log('Not authenticated, showing error');
      showError('يرجى تسجيل الدخول للإعجاب بالمنشورات');
      return;
    }

    console.log('Calling postsAPI.like...');
    try {
      const result = await postsAPI.like(postId);
      console.log('Like result:', result);
      
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
      console.log('Posts updated');
    } catch (error) {
      console.error('Like error:', error);
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
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      {/* Custom Animations Styles */}
      <style>{customAnimations}</style>
      
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
              selectedTag={filters.tag}
              onSelectCategory={(categoryId) => setFilters({ ...filters, category: categoryId })}
              onSelectTag={(tag) => setFilters({ ...filters, tag })}
              onClearFilters={() => setFilters({ category: '', tag: '', sort: 'createdAt' })}
              onClearTagFilter={handleClearTagFilter}
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
                      onSave={() => handleSavePost(post._id)}
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePostClick(post)}
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

      {/* Edit Post Modal */}
      {showEditModal && postToEdit && (
        <EditPostModal
          post={postToEdit}
          categories={categories}
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
