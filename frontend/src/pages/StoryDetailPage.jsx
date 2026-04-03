import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { storiesAPI } from '../services/communityApi.js';
import { getApiUrl } from '../config.js';

const StoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    try {
      setLoading(true);
      const data = await storiesAPI.getById(id);
      setStory(data);

      // Count likes from array
      const count = Array.isArray(data.likes) ? data.likes.length : 0;
      setLikeCount(count);

      // Check if current user liked this story (likes is array of ObjectIds)
      if (user && Array.isArray(data.likes)) {
        const userIdStr = user._id?.toString();
        const hasLiked = data.likes.some(likeId => likeId.toString() === userIdStr);
        setIsLiked(hasLiked);
      }
    } catch (error) {
      navigate('/stories');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) {
      if (!isAuthenticated) navigate('/login', { state: { from: `/stories/${id}` } });
      return;
    }

    setIsLiking(true);

    // Optimistic update
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? likeCount - 1 : likeCount + 1);

    try {
      await storiesAPI.like(id);
    } catch (error) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikeCount(prevLiked ? likeCount + 1 : likeCount - 1);
    } finally {
      setIsLiking(false);
    }
  };

  const getCategoryBadge = (category) => {
    const categories = {
      recovery: { color: 'bg-green-500/20 text-green-500', label: 'التعافي' },
      relationships: { color: 'bg-purple-500/20 text-purple-500', label: 'العلاقات' },
      depression: { color: 'bg-blue-500/20 text-blue-500', label: 'الاكتئاب' },
      anxiety: { color: 'bg-yellow-500/20 text-yellow-500', label: 'القلق' },
      addiction: { color: 'bg-red-500/20 text-red-500', label: 'الإدمان' },
      other: { color: 'bg-gray-500/20 text-gray-500', label: 'أخرى' },
    };
    const cat = categories[category] || categories.other;
    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${cat.color}`}>
        {cat.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-inbox text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">القصة غير موجودة</h2>
          <Link to="/stories" className="text-[var(--primary-color)] hover:underline">
            العودة للقصص
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/stories')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          <i className="fas fa-arrow-right"></i>
          <span>العودة للقصص</span>
        </button>

        {/* Story Card */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-4 md:p-8 border border-[var(--border-color)]/30 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 overflow-hidden">
                  {story.authorId?.avatar ? (
                    <img 
                      src={getApiUrl(story.authorId.avatar)} 
                      alt={story.authorId?.firstName} 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  ) : (
                    story.authorId?.firstName?.charAt(0) || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] break-words max-w-full">
                    {story.authorId?.firstName || 'مجهول'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-[var(--text-secondary)] mt-1">
                    <span className="break-all">{new Date(story.createdAt).toLocaleDateString('ar-EG', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span className="flex-shrink-0">•</span>
                    {getCategoryBadge(story.category)}
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] mb-6 break-words max-w-full leading-tight">
              {story.title}
            </h1>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-[var(--text-secondary)] mb-6 pb-6 border-b border-[var(--border-color)]/20">
              <span className="flex items-center gap-2 flex-shrink-0">
                <i className="far fa-clock"></i>
                {story.readTime} دقائق قراءة
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors flex-shrink-0 ${
                  isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
                }`}
              >
                <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                {likeCount} إعجاب
              </button>
            </div>

            {/* Content */}
            <div className="mb-8">
              <div className="text-[var(--text-primary)] leading-loose text-base md:text-lg whitespace-pre-wrap break-words max-w-full overflow-wrap-anywhere">
                {story.content}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-[var(--border-color)]/20 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLike}
                className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm md:text-base ${
                  isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'
                }`}
              >
                <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                {isLiked ? 'أعجبني' : 'إعجاب'}
              </button>
              <Link
                to="/stories"
                className="flex-1 sm:flex-none px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-semibold hover:bg-[var(--border-color)] transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <i className="fas fa-list"></i>
                تصفح القصص
              </Link>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default StoryDetailPage;
