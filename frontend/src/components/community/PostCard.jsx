import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { postsAPI } from '../../services/communityApi.js';
import CommentSection from './CommentSection.jsx';

const PostCard = ({ post, onLike, isAuthenticated }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffInDays === 1) {
      return 'أمس';
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} أيام`;
    } else {
      return formatDate(dateString);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const postId = post._id || post.id;
  
  // Check if current user has liked this post (don't use useMemo to ensure it recalculates on every render)
  const isLiked = user && post.likes?.some(likeId => likeId === user.id || likeId === user._id);
  
  // Get avatar URL (convert relative to absolute if needed)
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('/') ? `http://localhost:4000${avatarPath}` : avatarPath;
  };
  
  const authorAvatar = getAvatarUrl(post.authorId?.avatar);

  const toggleExpand = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    
    // Track view when post is expanded
    if (willExpand && postId) {
      postsAPI.trackView(postId).catch(err => console.error('Failed to track view:', err));
    }
  };

  const toggleComments = () => {
    const willShow = !showComments;
    setShowComments(willShow);
    if (willShow) {
      setIsExpanded(true); // Expand post when opening comments
      // Scroll to comments section smoothly
      setTimeout(() => {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Check if content is long enough to need truncation (approx 300 chars for 3 lines)
  const needsExpandButton = post.content.length > 300 || post.images?.length > 2;

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/30 transition-all duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold overflow-hidden">
              {authorAvatar ? (
                <img src={authorAvatar} alt={post.authorId?.firstName} className="w-full h-full object-cover" />
              ) : (
                post.authorId?.firstName?.charAt(0) || 'م'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-[var(--text-primary)] break-words">
                {post.isAnonymous ? 'مجهول' : `${post.authorId?.firstName} ${post.authorId?.lastName}`}
              </p>
              <p className="text-xs text-[var(--text-secondary)] break-words">
                {formatRelativeTime(post.createdAt)} • {post.categoryId?.nameAr || 'عام'}
              </p>
            </div>
          </div>
        </div>

        {/* Post Title */}
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 break-words">
          {post.title}
        </h3>

        {/* Post Content - Truncated or Full */}
        <div className={`text-[var(--text-secondary)] mb-4 break-words ${isExpanded ? '' : 'line-clamp-3'}`}>
          {post.content}
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${isExpanded ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {post.images.slice(0, isExpanded ? post.images.length : 2).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg object-cover h-32 w-full"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Show More/Less Button - Only show when content is long enough */}
        {needsExpandButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium mb-4"
          >
            {isExpanded ? (
              <>
                <i className="fas fa-chevron-up ml-1"></i>
                عرض أقل
              </>
            ) : (
              <>
                <i className="fas fa-chevron-down ml-1"></i>
                عرض المزيد
              </>
            )}
          </button>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={() => onLike(postId)}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 transition-colors ${
                isAuthenticated
                  ? isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
                  : 'text-[var(--text-secondary)]/50 cursor-not-allowed'
              }`}
            >
              <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
              <span className="text-sm">{formatNumber(post.likes?.length || 0)}</span>
            </button>

            {/* Comments Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleComments();
              }}
              className={`flex items-center gap-2 transition-colors ${
                showComments ? 'text-[var(--primary-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary-color)]'
              }`}
            >
              <i className={`far fa-comment${showComments ? 's' : ''}`}></i>
              <span className="text-sm">{formatNumber(post.commentsCount || 0)}</span>
            </button>

            {/* Views */}
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <i className="far fa-eye"></i>
              <span className="text-sm">{formatNumber(post.views || 0)}</span>
            </div>
          </div>

          {/* Report Button */}
          <button className="text-[var(--text-secondary)] hover:text-red-500 transition-colors">
            <i className="fas fa-flag"></i>
          </button>
        </div>
      </div>

      {/* Comments Section (shown when showComments is true) */}
      {showComments && (
        <div id={`comments-${postId}`} className="px-6 py-4 border-t border-[var(--border-color)]/30 bg-[var(--bg-primary)]">
          <CommentSection postId={postId} />
        </div>
      )}
    </div>
  );
};

export default PostCard;
