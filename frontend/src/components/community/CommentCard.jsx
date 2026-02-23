import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ReportModal from './ReportModal.jsx';

const CommentCard = ({ comment, onLike, onDelete, onEdit, isAuthenticated, isDeleting = false }) => {
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
    return avatarPath.startsWith('/') ? `http://localhost:4000${avatarPath}` : avatarPath;
  };

  const authorAvatar = getAvatarUrl(comment.authorId?.avatar);
  const isAuthor = user && (comment.authorId?._id === user.id || comment.authorId?._id === user._id);

  return (
    <div className={`bg-[var(--bg-secondary)] rounded-xl p-6 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
          {authorAvatar ? (
            <img src={authorAvatar} alt={comment.authorId?.firstName} className="w-full h-full object-cover" />
          ) : (
            comment.authorId?.firstName?.charAt(0) || 'م'
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold text-[var(--text-primary)]">
                {comment.isAnonymous ? 'مجهول' : `${comment.authorId?.firstName} ${comment.authorId?.lastName}`}
              </span>
              <span className="text-xs text-[var(--text-secondary)] mr-2">•</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Author Actions */}
            {isAuthor && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className={`text-red-500 hover:text-red-600 transition-colors text-sm ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isDeleting ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-trash"></i>
                )}
              </button>
            )}
          </div>

          <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 transition-colors ${
                isAuthenticated
                  ? isLiked ? 'text-red-500' : 'text-[var(--text-secondary)] hover:text-red-500'
                  : 'text-[var(--text-secondary)]/50 cursor-not-allowed'
              }`}
            >
              <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
              <span className="text-sm">{likesCount}</span>
            </button>

            <button className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors text-sm">
              <i className="fas fa-reply"></i>
              <span className="mr-1">رد</span>
            </button>

            {/* Edit Button (Author only) */}
            {isAuthor && (
              <button
                onClick={() => onEdit(comment)}
                className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors text-sm"
                title="تعديل التعليق"
              >
                <i className="fas fa-pen"></i>
                <span className="mr-1">تعديل</span>
              </button>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="text-[var(--text-secondary)] hover:text-red-500 transition-colors text-sm"
              title="الإبلاغ عن التعليق"
            >
              <i className="fas fa-flag"></i>
              <span className="mr-1">إبلاغ</span>
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
