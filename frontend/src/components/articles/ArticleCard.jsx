import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../config.js';

const ArticleCard = ({ article, featured = false }) => {
  const navigate = useNavigate();

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
          <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-[var(--border-color)]/20">
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <i className="far fa-calendar"></i>
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
              <span>•</span>
              <i className="far fa-clock"></i>
              <span>{article.readTime || 5} دقائق</span>
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
        <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)] flex-wrap pt-3 border-t border-[var(--border-color)]/20">
          <div className="flex items-center gap-2">
            <i className="far fa-calendar"></i>
            <span className="whitespace-nowrap">{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <i className="far fa-clock"></i>
            <span className="whitespace-nowrap">{article.readTime || 5} دقائق</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
