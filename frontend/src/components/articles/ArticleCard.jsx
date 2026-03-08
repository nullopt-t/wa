import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { articlesAPI } from '../../services/communityApi.js';
import { getApiUrl } from '../../config.js';

const ArticleCard = ({ article, featured = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error: showError } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(Array.isArray(article.likes) ? article.likes.length : (article.likes || 0));
  const [isLiked, setIsLiked] = useState(false);

  // Check if user has liked this article on mount
  useEffect(() => {
    if (isAuthenticated && user && Array.isArray(article.likes)) {
      const hasLiked = article.likes.some(likeId => 
        likeId === user.id || likeId === user._id || likeId._id === user.id || likeId._id === user._id
      );
      setIsLiked(hasLiked);
    }
  }, [article.likes, isAuthenticated, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleClick = () => {
    navigate(`/articles/${article.slug || article._id}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالمقال');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await articlesAPI.like(article._id);
      setLikesCount(result.likes?.length || 0);
      setIsLiked(!isLiked); // Toggle liked state
    } catch (error) {
      showError(error.message || 'فشل الإعجاب بالمقال');
    } finally {
      setIsLiking(false);
    }
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return getApiUrl(avatarPath);
  };

  const getCoverImageUrl = (coverImagePath) => {
    if (!coverImagePath) return null;
    return getApiUrl(coverImagePath);
  };

  const authorAvatar = getAvatarUrl(article.authorId?.avatar);
  const coverImage = getCoverImageUrl(article.coverImage);

  if (featured) {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer bg-[var(--card-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 hover:shadow-xl flex flex-col"
      >
        {/* Cover Image */}
        {coverImage && (
          <div className="relative h-64 md:h-80 overflow-hidden flex-shrink-0">
            <img
              src={coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="px-3 py-1 bg-[var(--primary-color)] text-white text-xs rounded-full whitespace-nowrap">
                مميز
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 min-h-[4rem]">
            {article.title}
          </h2>
          <p className="text-[var(--text-secondary)] mb-4 line-clamp-3 flex-grow">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {authorAvatar ? (
                  <img src={authorAvatar} alt={article.authorId?.firstName} className="w-full h-full object-cover" />
                ) : (
                  article.authorId?.firstName?.charAt(0) || 'ك'
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {article.authorId?.firstName} {article.authorId?.lastName}
                </p>
                <p className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                  {formatDate(article.publishedAt || article.createdAt)} • {article.readTime || 5} دقائق
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] flex-shrink-0">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 transition-all ${
                  isLiked || isLiking
                    ? 'text-red-500 scale-110'
                    : 'hover:text-red-500 hover:scale-110'
                } disabled:opacity-50`}
              >
                <i className={`${isLiked ? 'fas' : 'far'} fa-heart ${isLiking ? 'fa-beat' : ''}`}></i>
                <span>{likesCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card
  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-[var(--card-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 hover:shadow-lg flex flex-col"
    >
      {/* Cover Image */}
      {coverImage && (
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <img
            src={coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full whitespace-nowrap"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 min-h-[3rem]">
          {article.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 flex-grow">
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white text-xs overflow-hidden flex-shrink-0">
              {authorAvatar ? (
                <img src={authorAvatar} alt={article.authorId?.firstName} className="w-full h-full object-cover" />
              ) : (
                article.authorId?.firstName?.charAt(0) || 'ك'
              )}
            </div>
            <span className="truncate max-w-[120px]">
              {article.authorId?.firstName}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="whitespace-nowrap">{article.readTime || 5} دقائق</span>
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1 transition-all whitespace-nowrap ${
                isLiked || isLiking
                  ? 'text-red-500 scale-110'
                  : 'hover:text-red-500 hover:scale-110'
              } disabled:opacity-50`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart ${isLiking ? 'fa-beat' : ''}`}></i>
              <span>{likesCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
