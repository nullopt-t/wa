import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import PostCard from '../components/community/PostCard.jsx';
import CommentSection from '../components/community/CommentSection.jsx';
import { postsAPI } from '../services/communityApi.js';
import { API_URL } from '../config.js';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsPagination, setCommentsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Load post data
  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      // Use environment variable for API URL
      let apiUrl = `${API_URL}/community/posts/detail/${postId}`;

      
      const response = await fetch(apiUrl);
      
      
      console.log('Response headers:', response.headers.get('content-type'));
      
      const responseText = await response.text();
      console.log('Response text:', responseText.substring(0, 200));
      
      if (!response.ok) {
        if (response.status === 404) {
          showError('المنشور غير موجود');
          setTimeout(() => navigate('/community'), 2000);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(responseText);
      
      
      if (!data.post) {
        throw new Error('No post data in response');
      }
      
      setPost(data.post);
      setComments(data.comments || []);
      setCommentsPagination(data.commentsPagination || {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      });
    } catch (error) {
      
      ;
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (id) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالمنشورات');
      return;
    }

    try {
      const result = await postsAPI.like(id);
      setPost({
        ...post,
        likes: result.likes || [],
      });
    } catch (error) {
      ;
    }
  };

  const handleSavePost = async (id) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول لحفظ المنشورات');
      return;
    }

    try {
      const result = await postsAPI.save(id);
      setPost({
        ...post,
        savedBy: result.savedBy || [],
      });
    } catch (error) {
      ;
    }
  };

  const handleEditPost = (editPost) => {
    // Navigate to community page with edit modal
    // For now, just show a message
    showError('تعديل المنشور غير متاح في صفحة التفاصيل');
  };

  const handleDeletePost = () => {
    // For now, just show a message
    showError('حذف المنشور غير متاح في صفحة التفاصيل');
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

  if (!post) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">المنشور غير موجود</h2>
            <p className="text-[var(--text-secondary)] mb-4">لم يتم تحميل بيانات المنشور</p>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              العودة إلى المجتمع
            </button>
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
              onClick={() => navigate('/community')}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors mb-4"
            >
              <i className="fas fa-arrow-right"></i>
              <span>العودة إلى المجتمع</span>
            </button>
            
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Link
                to={`/community?category=${post.categoryId?._id}`}
                className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--primary-color)] hover:text-white transition-colors"
              >
                {post.categoryId?.name || 'عام'}
              </Link>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
              <span>•</span>
              <span>{post.commentsCount || 0} تعليق</span>
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post Card - Full Width */}
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
                <PostCard
                  post={post}
                  onLike={handleLikePost}
                  onSave={handleSavePost}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </AnimatedItem>

            {/* Comments Section */}
            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="mt-6">
                <CommentSection
                  postId={postId}
                  postAuthorId={post.authorId?._id}
                  onCommentsChange={() => {}}
                  onPostUpdate={loadPostData}
                />
              </div>
            </AnimatedItem>
          </div>

          {/* Sidebar - Community Guidelines Only */}
          <AnimatedItem type="slideRight" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <i className="fas fa-book text-[var(--primary-color)]"></i>
                إرشادات المجتمع
              </h3>

              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <span>احترم آراء الآخرين وتجاربهم</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <span>لا تشارك معلومات شخصية حساسة</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <span>التزم بالموضوعات المتعلقة بالصحة النفسية</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <span>تجنب النصائح الطبية المتخصصة</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="fas fa-check-circle text-green-500 mt-1"></i>
                  <span>بلغ عن المحتوى غير المناسب</span>
                </li>
              </ul>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
