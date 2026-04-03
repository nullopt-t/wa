import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { postsAPI } from '../../services/communityApi.js';
import CommentSection from './CommentSection.jsx';
import ReportModal from './ReportModal.jsx';
import { createPortal } from 'react-dom';
import { getApiUrl } from '../../config.js';

const PostCard = ({ post, onLike, onSave, isAuthenticated, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.commentsCount || 0);
  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [needsExpand, setNeedsExpand] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const postId = post._id || post.id;

  // Sync comments count when post prop changes
  useEffect(() => {
    setLocalCommentsCount(post.commentsCount || 0);
  }, [post.commentsCount]);

  // Check if current user is the post author
  const userId = user?.id || user?._id;
  const isPostAuthor = user && post.authorId && (post.authorId._id === userId || post.authorId._id === userId);

  // Calculate like state directly from props (no local state to avoid sync issues)
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

  // Check if content needs expand button
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
    return getApiUrl(avatarPath);
  };

  const authorAvatar = getAvatarUrl(post.authorId?.avatar);
  const authorName = post.isAnonymous 
    ? 'مجهول' 
    : `${post.authorId?.firstName || ''} ${post.authorId?.lastName || ''}`.trim() || 'مستخدم';

  const toggleComments = () => {
    // Navigate to post detail page where all comments are visible
    navigate(`/community/post/${postId}`);
  };

  const handleLike = async () => {
    
    
    if (!isAuthenticated || isLiking) {
      
      return;
    }
    
    setIsLiking(true);
    try {
      if (onLike) {
        await onLike(postId);
      } else {
        
      }
    } catch (error) {
      
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
      
    }
  };

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => (prev - 1 + post.images.length) % post.images.length);
  };

  const handleSave = async () => {
    if (!isAuthenticated || isSaving) return;
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(postId);
      }
    } catch (error) {
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (!post.isAnonymous && post.authorId?._id) {
      navigate(`/user/${post.authorId._id}`);
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
    <>
      <div
        ref={cardRef}
        className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/30 transition-all duration-300 relative"
      >
      {/* Top Action Buttons (Share & Save) - Top Left Corner */}
      <div className="absolute top-2 md:top-4 left-2 md:left-4 z-10 flex items-center gap-1 md:gap-2">
        {/* Share Button (Copy Link) */}
        <div className="relative group">
          <button
            onClick={handleShare}
            className="w-8 h-8 md:w-10 md:h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:scale-110 transition-all duration-300 shadow-lg"
            title="نسخ رابط المنشور"
          >
            <i className="fas fa-link text-sm md:text-base"></i>
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
        {/* Top Right Action Buttons */}
        <div className="hidden md:flex absolute top-4 right-4 gap-2">
          {/* Edit Button (Author Only) */}
          {isPostAuthor && (
            <button
              onClick={() => onEdit && onEdit(post)}
              className="w-10 h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] hover:scale-110 transition-all duration-300 shadow-lg"
              title="تعديل المنشور"
            >
              <i className="fas fa-pen"></i>
            </button>
          )}
          
          {/* Delete Button (Author Only) */}
          {isPostAuthor && (
            <button
              onClick={() => onDelete && onDelete(post)}
              className="w-10 h-10 bg-[var(--card-bg)]/90 backdrop-blur-sm border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500 hover:scale-110 transition-all duration-300 shadow-lg"
              title="حذف المنشور"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
          
          {/* Report Button */}
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
            <div 
              className={`w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden ${!post.isAnonymous ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onClick={!post.isAnonymous ? handleAvatarClick : undefined}
            >
              {post.isAnonymous ? (
                <i className="fas fa-user-secret text-xl"></i>
              ) : authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                authorName.charAt(0) || 'م'
              )}
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="overflow-hidden">
                <p className="font-bold text-[var(--text-primary)] break-words">
                  {post.isAnonymous ? 'مجهول' : authorName}
                </p>
                <p className="text-xs text-[var(--text-secondary)] break-words">
                  {formatRelativeTime(post.createdAt)} • {post.categoryId?.nameAr || 'عام'}
                </p>
              </div>
              {!post.isAnonymous && (
                <button
                  onClick={handleAvatarClick}
                  className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors flex-shrink-0"
                  title="عرض ملف المستخدم"
                >
                  <i className="fas fa-external-link-alt text-sm"></i>
                </button>
              )}
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
          <div className="mb-4">
            {/* Single Image - Full Width */}
            {post.images.length === 1 && (
              <div className="relative overflow-hidden rounded-xl cursor-pointer" onClick={() => openImageModal(0)}>
                <img
                  src={getApiUrl(post.images[0])}
                  alt="Post image"
                  className="w-full max-h-[500px] object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Two Images - Side by Side */}
            {post.images.length === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl cursor-pointer"
                    onClick={() => openImageModal(index)}
                  >
                    <img
                      src={getApiUrl(image)}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Three or More Images - Grid with "View More" */}
            {post.images.length >= 3 && (
              <div className="grid grid-cols-2 gap-2">
                {/* First Image - Full Height */}
                <div
                  className="row-span-2 relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => openImageModal(0)}
                >
                  <img
                    src={getApiUrl(post.images[0])}
                    alt="Post image 1"
                    className="w-full h-full min-h-[300px] object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Second Image */}
                <div
                  className="relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => openImageModal(1)}
                >
                  <img
                    src={getApiUrl(post.images[1])}
                    alt="Post image 2"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Third Image with "+X" overlay */}
                <div
                  className="relative overflow-hidden rounded-xl cursor-pointer"
                  onClick={() => openImageModal(2)}
                >
                  <img
                    src={getApiUrl(post.images[2])}
                    alt="Post image 3"
                    className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {post.images.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                      <span className="text-white font-bold text-2xl">+{post.images.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          </div>

          {/* Mobile Action Buttons */}
          <div className="md:hidden flex items-center gap-2">
            {/* Edit Button (Author Only) */}
            {isPostAuthor && (
              <button
                onClick={() => onEdit && onEdit(post)}
                className="w-9 h-9 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)]"
                title="تعديل المنشور"
              >
                <i className="fas fa-pen text-sm"></i>
              </button>
            )}
            
            {/* Delete Button (Author Only) */}
            {isPostAuthor && (
              <button
                onClick={() => onDelete && onDelete(post)}
                className="w-9 h-9 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500"
                title="حذف المنشور"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            )}
            
            {/* Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="w-9 h-9 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500"
              title="الإبلاغ عن المنشور"
            >
              <i className="fas fa-flag text-sm"></i>
            </button>
          </div>
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

      {/* Image Lightbox - Rendered via Portal at document.body level */}
      {showImageModal && post.images && (
        <ImageLightbox
          images={post.images}
          currentIndex={currentImageIndex}
          onClose={closeImageModal}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
};

// Image Lightbox Modal Component (rendered via Portal)
const ImageLightbox = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between p-4 md:p-6" style={{ zIndex: 10000 }}>
        {/* Close Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="text-white hover:text-gray-300 transition-colors p-3 bg-black/50 rounded-full hover:bg-black/70"
          aria-label="Close"
        >
          <i className="fas fa-times text-2xl md:text-3xl"></i>
        </button>

        {/* Image Counter */}
        <div className="bg-black/60 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="text-white hover:text-gray-300 transition-colors p-3 md:p-4 bg-black/50 rounded-full hover:bg-black/70"
            aria-label="Previous image"
          >
            <i className="fas fa-chevron-left text-xl md:text-2xl"></i>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="text-white hover:text-gray-300 transition-colors p-3 md:p-4 bg-black/50 rounded-full hover:bg-black/70"
            aria-label="Next image"
          >
            <i className="fas fa-chevron-right text-xl md:text-2xl"></i>
          </button>
        </div>
      </div>

      {/* Image Container - Centers the image */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8" style={{ zIndex: 10000 }}>
        <img
          src={getApiUrl(images[currentIndex])}
          alt={`Post image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Touch Areas for Mobile Swipe */}
      <div 
        className="absolute inset-y-0 left-0 w-1/3 md:hidden"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        style={{ zIndex: 9999 }}
      ></div>
      <div 
        className="absolute inset-y-0 right-0 w-1/3 md:hidden"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        style={{ zIndex: 9999 }}
      ></div>
    </div>,
    document.body
  );
};

export default PostCard;
