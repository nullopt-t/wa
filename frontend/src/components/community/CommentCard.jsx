import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import ReportModal from './ReportModal.jsx';
import { getApiUrl } from '../../config.js';

const CommentCard = ({ comment, onLike, onDelete, onEdit, onReply, isAuthenticated, isDeleting = false, isPostAuthor = false, isReply = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  // Calculate like state - handle both ObjectId and string formats
  const userId = user?.id || user?._id;
  const commentLikes = comment.likes || [];
  const isLiked = commentLikes.some(likeId => (likeId._id || likeId) === userId);
  const likesCount = commentLikes.length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return getApiUrl(avatarPath);
  };

  const authorAvatar = getAvatarUrl(comment.authorId?.avatar);
  const isCommentAuthor = user && (comment.authorId?._id === user.id || comment.authorId?._id === user._id);
  
  // Post author or comment author can edit
  const canEdit = isCommentAuthor || isPostAuthor;

  const handleAvatarClick = () => {
    if (!comment.isAnonymous && comment.authorId?._id) {
      navigate(`/user/${comment.authorId._id}`);
    }
  };

  return (
    <div className={`${isReply ? 'bg-[var(--bg-secondary)]/50' : 'bg-[var(--bg-secondary)]'} rounded-xl p-3 md:p-6 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-2 md:gap-4">
        {/* Avatar */}
        <div
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden ${!comment.isAnonymous ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={!comment.isAnonymous ? handleAvatarClick : undefined}
        >
          {comment.isAnonymous ? (
            <i className="fas fa-user-secret text-base md:text-xl"></i>
          ) : authorAvatar ? (
            <img src={authorAvatar} alt={comment.authorId?.firstName} className="w-full h-full object-cover" />
          ) : (
            comment.authorId?.firstName?.charAt(0) || 'م'
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
            <div className="min-w-0 flex-1">
              <span className="font-bold text-[var(--text-primary)] text-sm md:text-base block truncate">
                {comment.isAnonymous ? 'مجهول' : `${comment.authorId?.firstName} ${comment.authorId?.lastName}`}
              </span>
              <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Author Actions */}
            {canEdit && (
              <div className="flex gap-1 md:gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(comment)}
                  className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors p-1 md:p-2"
                  title="تعديل التعليق"
                >
                  <i className="fas fa-pen text-xs md:text-sm"></i>
                </button>
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className={`text-red-500 hover:text-red-600 transition-colors p-1 md:p-2 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="حذف التعليق"
                >
                  {isDeleting ? (
                    <i className="fas fa-spinner fa-spin text-xs md:text-sm"></i>
                  ) : (
                    <i className="fas fa-trash text-xs md:text-sm"></i>
                  )}
                </button>
              </div>
            )}
          </div>

          <p className="text-[var(--text-secondary)] leading-relaxed mb-2 md:mb-3 text-sm md:text-base break-words whitespace-pre-wrap">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4 flex-wrap flex-shrink-0">
            <button
              onClick={onLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1 md:gap-2 transition-colors flex-shrink-0 ${
                isAuthenticated
                  ? isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
                  : 'text-[var(--text-secondary)]/50 cursor-not-allowed'
              }`}
            >
              <i className={isLiked ? 'fas fa-heart text-xs md:text-sm' : 'far fa-heart text-xs md:text-sm'}></i>
              <span className="text-xs md:text-sm whitespace-nowrap">{likesCount}</span>
            </button>

            <button
              onClick={onReply}
              className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors text-xs md:text-sm flex-shrink-0"
            >
              <i className="fas fa-reply text-xs md:text-sm"></i>
              <span className="mr-1 whitespace-nowrap">رد</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="text-[var(--text-secondary)] hover:text-red-500 transition-colors text-xs md:text-sm flex-shrink-0"
              title="الإبلاغ عن التعليق"
            >
              <i className="fas fa-flag text-xs md:text-sm"></i>
              <span className="mr-1 whitespace-nowrap">إبلاغ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          targetType="comment"
          targetId={comment._id}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default CommentCard;
