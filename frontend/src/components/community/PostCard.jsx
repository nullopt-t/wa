import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { postsAPI } from '../../services/communityApi.js';
import CommentSection from './CommentSection.jsx';
import ReportModal from './ReportModal.jsx';

const PostCard = ({ post, onLike, onSave, isAuthenticated }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [localViews, setLocalViews] = useState(post.views || 0);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);
  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [needsExpand, setNeedsExpand] = useState(false);
  const viewTrackedRef = useRef(false);

  const postId = post._id || post.id;

  // Calculate like state directly from props (no local state to avoid sync issues)
  const userId = user?.id || user?._id;
  const likesArray = post.likes || [];
  const localIsLiked = likesArray.some(
    likeId => (likeId._id || likeId) === userId
  );
  const localLikes = likesArray.length;

  // Calculate saved state
  const savedByArray = post.savedBy || [];
  const isSaved = savedByArray.some(
    saveId => (saveId._id || saveId) === userId
  );

  // Helper functions
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

  // Track view when post scrolls into viewport (with Intersection Observer)
  useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    // Check localStorage first
    const hasViewed = localStorage.getItem(`viewed_post_${postId}`);
    if (hasViewed || viewTrackedRef.current) {
      return; // Already tracked
    }

    // Create Intersection Observer to track when post is actually visible
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        // Post is at least 50% visible for 1 second
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Debounce: wait 1 second to ensure user actually sees it
          setTimeout(() => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !viewTrackedRef.current) {
              viewTrackedRef.current = true;
              localStorage.setItem(`viewed_post_${postId}`, 'true');

              // Optimistic update
              setLocalViews(prev => prev + 1);

              // Track view on server
              postsAPI.trackView(postId)
                .then(data => {
                  if (data && data.views) {
                    setLocalViews(data.views);
                  }
                })
                .catch(err => console.error('Failed to track view:', err));

              // Stop observing
              observer.disconnect();
            }
          }, 1000); // 1 second visibility threshold
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: [0.5, 0.75, 1.0], // Trigger at 50%, 75%, 100% visibility
      }
    );

    observer.observe(cardElement);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [postId]);

  // Check if content needs expand button - FIXED LOGIC
  useEffect(() => {
    // Don't show button if already expanded
    if (isExpanded) {
      setNeedsExpand(false);
      return;
    }
    
    // Check if content is long enough to need truncation
    const contentLength = post.content?.length || 0;
    const hasImages = post.images && post.images.length > 0;
    
    // Show button if:
    // 1. Content is longer than ~300 characters (about 3-4 lines)
    // 2. OR has more than 2 images
    const needsButton = contentLength > 300 || (hasImages && post.images.length > 2);
    
    setNeedsExpand(needsButton);
  }, [post.content, post.images, isExpanded]);

  // Get avatar URL (convert relative to absolute if needed)
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath.startsWith('/') ? `http://localhost:4000${avatarPath}` : avatarPath;
  };

  const authorAvatar = getAvatarUrl(post.authorId?.avatar);

  const toggleComments = () => {
    // Navigate to post detail page where all comments are visible
    navigate(`/community/post/${postId}`);
  };

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    try {
      await onLike(postId);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    // Use current page URL for production, fallback to localhost for dev
    const shareUrl = `${window.location.origin}/community/post/${postId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Show copied feedback
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated || isSaving) return;
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(postId);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Scroll to top of card if expanding and user is below it
    if (!isExpanded && cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      if (cardRect.top < 0) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/30 transition-all duration-300 overflow-hidden relative"
    >
      {/* Top Action Buttons (Share & Save) - Top Left Corner */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        {/* Share Button (Copy Link) */}
        <div className="relative group">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:scale-110 transition-all duration-300 shadow-lg"
            title="نسخ رابط المنشور"
          >
            <i className="fas fa-link"></i>
          </button>
          {/* Copied Tooltip */}
          <div className={`absolute left-0 top-full mt-2 transition-all duration-300 ${showCopiedTooltip ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="bg-[var(--primary-color)] text-white px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shadow-xl">
              <i className="fas fa-check ml-1"></i>
              تم نسخ الرابط
            </div>
          </div>
          {/* Hover Tooltip */}
          <div className={`absolute left-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ${showCopiedTooltip ? 'hidden' : ''}`}>
            <div className="bg-[var(--card-bg)] px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] whitespace-nowrap shadow-xl border border-[var(--border-color)]">
              نسخ الرابط
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="relative group">
          <button
            onClick={handleSave}
            disabled={!isAuthenticated || isSaving}
            className={`w-10 h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              isAuthenticated && !isSaving
                ? isSaved 
                  ? 'text-[var(--primary-color)] border-[var(--primary-color)] bg-[var(--primary-color)]/10 hover:scale-110' 
                  : 'text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:scale-110'
                : 'text-[var(--text-secondary)]/50 border-[var(--border-color)] cursor-not-allowed'
            }`}
            title={isSaved ? 'إزالة من المحفوظات' : 'حفظ في المفضلة'}
          >
            {isSaving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : isSaved ? (
              <i className="fas fa-bookmark animate-bounce-subtle"></i>
            ) : (
              <i className="far fa-bookmark hover:animate-bounce-subtle"></i>
            )}
          </button>
          {/* Saved Tooltip */}
          <div className={`absolute left-0 top-full mt-2 transition-all duration-300 ${showCopiedTooltip ? 'hidden' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
            <div className="bg-[var(--card-bg)] px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] whitespace-nowrap shadow-xl border border-[var(--border-color)]">
              {isSaved ? 'محفوظ' : 'حفظ'}
            </div>
          </div>
        </div>
      </div>

      {/* Post Header */}
      <div className="p-6 pb-4 overflow-hidden pt-16">
        {/* Desktop Report Button (Top Right) */}
        <div className="hidden md:block absolute top-4 right-4">
          <button
            onClick={() => setShowReportModal(true)}
            className="w-10 h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 hover:scale-110 transition-all duration-300 shadow-lg"
            title="الإبلاغ عن المنشور"
          >
            <i className="fas fa-flag"></i>
          </button>
        </div>

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
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 break-words line-clamp-2">
          {post.title}
        </h3>

        {/* Post Content - Truncated or Full */}
        <div
          ref={contentRef}
          className={`text-[var(--text-secondary)] mb-4 break-words ${
            isExpanded ? '' : 'line-clamp-3'
          }`}
          style={{ overflow: isExpanded ? 'visible' : 'hidden' }}
        >
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
                className="rounded-lg object-cover h-32 w-full hover:scale-105 transition-transform duration-300"
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
                className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Show More/Less Button - Enhanced with better styling */}
        {needsExpand && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            className="flex items-center gap-2 text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium mb-4 px-4 py-2 rounded-lg hover:bg-[var(--primary-color)]/10 transition-all duration-300 group"
          >
            <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} transition-transform duration-300 group-hover:scale-110`}></i>
            <span>{isExpanded ? 'عرض أقل' : 'عرض المزيد'}</span>
          </button>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center gap-2 transition-colors ${
                isAuthenticated && !isLiking
                  ? localIsLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
                  : 'text-[var(--text-secondary)]/50 cursor-not-allowed'
              }`}
            >
              {isLiking ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={localIsLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
              )}
              <span className="text-sm">{formatNumber(localLikes)}</span>
            </button>

            {/* Comments Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleComments();
              }}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
              title="عرض جميع التعليقات"
            >
              <i className="far fa-comment"></i>
              <span className="text-sm">{formatNumber(localCommentsCount)}</span>
            </button>

            {/* Views */}
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <i className="far fa-eye"></i>
              <span className="text-sm">{formatNumber(localViews)}</span>
            </div>
          </div>

          {/* Report Button - Mobile (in action bar) */}
          <button
            onClick={() => setShowReportModal(true)}
            className="md:hidden text-[var(--text-secondary)] hover:text-red-500 transition-colors"
            title="الإبلاغ عن المنشور"
          >
            <i className="fas fa-flag"></i>
          </button>
        </div>
      </div>

      {/* Comments Section removed - clicks navigate to post detail page */}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="post"
          targetId={postId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
