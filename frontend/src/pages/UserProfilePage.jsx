import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import PostCard from '../components/community/PostCard.jsx';
import { postsAPI } from '../services/communityApi.js';
import { getApiUrl } from '../config.js';

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Load user's posts
  useEffect(() => {
    loadUserPosts();
  }, [userId]);

  const loadUserPosts = async (page = 1) => {
    try {
      setLoading(true);
      // Get all posts and filter by user
      const data = await postsAPI.getAll({ page: 1, limit: 100 });
      
      // Filter to show only this user's posts
      const userPosts = data.posts.filter(post => 
        post.authorId && post.authorId._id === userId
      );
      
      // Get user info from first post
      const firstPost = userPosts[0];
      if (firstPost && firstPost.authorId) {
        setUserProfile({
          ...firstPost.authorId,
          postCount: userPosts.length,
          firstName: firstPost.authorId.firstName,
          lastName: firstPost.authorId.lastName,
          createdAt: firstPost.createdAt, // Use first post date as join date approximation
        });
      }
      
      // Paginate the filtered posts
      const startIndex = (page - 1) * 20;
      const paginatedPosts = userPosts.slice(startIndex, startIndex + 20);
      
      setPosts(paginatedPosts);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(userPosts.length / 20),
        total: userPosts.length,
      });
    } catch (error) {
      console.error('Failed to load user posts:', error);
      showError('فشل تحميل منشورات المستخدم');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
          </div>
        </AnimatedItem>

        {/* User Profile Header */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 border border-[var(--border-color)]/30 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                {userProfile?.avatar ? (
                  <img
                    src={getApiUrl(userProfile.avatar)}
                    alt={userProfile?.firstName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  userProfile?.firstName?.charAt(0) || 'م'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'مستخدم'}
                  </h1>
                  {userProfile?.role === 'therapist' && (
                    <span className="px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm rounded-full font-medium">
                      <i className="fas fa-user-md ml-1"></i>
                      معالج
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-newspaper text-[var(--primary-color)]"></i>
                    <span><strong className="text-[var(--text-primary)]">{posts.length}</strong> منشور</span>
                  </div>
                  {userProfile?.createdAt && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-calendar text-[var(--primary-color)]"></i>
                      <span>انضم في {formatDate(userProfile.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Posts Section */}
        <div className="space-y-6">
          <AnimatedItem type="slideUp" delay={0.3}>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              منشورات المستخدم
            </h2>
          </AnimatedItem>

          {posts.length === 0 ? (
            <AnimatedItem type="slideUp" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                <i className="fas fa-newspaper text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد منشورات بعد</h3>
                <p className="text-[var(--text-secondary)]">هذا المستخدم لم ينشر أي منشورات بعد</p>
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
            <AnimatedItem type="slideUp" delay={0.5}>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => loadUserPosts(pagination.currentPage + 1)}
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

export default UserProfilePage;
