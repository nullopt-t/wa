import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import PostCard from '../components/community/PostCard.jsx';
import { postsAPI } from '../services/communityApi.js';

const SavedPostsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول لعرض المنشورات المحفوظة');
      navigate('/login');
    }
  }, [isAuthenticated]);

  // Load saved posts
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedPosts();
    }
  }, [isAuthenticated]);

  const loadSavedPosts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await postsAPI.getSaved(page);
      
      setPosts(data.posts);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to load saved posts:', error);
      showError(error.message || 'فشل تحميل المنشورات المحفوظة');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالمنشورات');
      return;
    }

    try {
      const result = await postsAPI.like(postId);
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
      // Remove from saved list if unsaved
      if (result.savedBy && !result.savedBy.includes(user.id)) {
        setPosts(posts.filter(post => post._id !== postId));
        success('تم إزالة المنشور من المحفوظات');
      } else {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              savedBy: result.savedBy || [],
            };
          }
          return post;
        }));
        success('تم حفظ المنشور');
      }
    } catch (error) {
      showError(error.message || 'فشل حفظ المنشور');
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Back Button */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors mb-4"
            >
              <i className="fas fa-arrow-right"></i>
              <span>العودة</span>
            </button>
            <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">المنشورات المحفوظة</h1>
            <p className="text-[var(--text-secondary)]">
              {posts.length} منشور {posts.length !== 1 ? 'محفوظ' : 'محفوظ'}
            </p>
          </div>
        </AnimatedItem>

        {/* Posts Section */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                <i className="fas fa-bookmark text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد منشورات محفوظة</h3>
                <p className="text-[var(--text-secondary)] mb-6">احفظ المنشورات المهمة للوصول إليها لاحقاً من هنا</p>
                <button
                  onClick={() => navigate('/community')}
                  className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <i className="fas fa-compass ml-2"></i>
                  تصفح المجتمع
                </button>
              </div>
            </AnimatedItem>
          ) : (
            posts.map((post, index) => (
              <AnimatedItem key={post._id} type="slideUp" delay={index * 0.1}>
                <PostCard
                  post={post}
                  onLike={() => handleLikePost(post._id)}
                  onSave={() => handleSavePost(post._id)}
                  isAuthenticated={isAuthenticated}
                />
              </AnimatedItem>
            ))
          )}

          {/* Load More */}
          {!loading && pagination.currentPage < pagination.totalPages && (
            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => loadSavedPosts(pagination.currentPage + 1)}
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
  );
};

export default SavedPostsPage;
