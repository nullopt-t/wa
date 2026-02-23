import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { commentsAPI } from '../../services/communityApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import CommentCard from './CommentCard.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';

const CommentSection = ({ postId }) => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      console.log('Loading comments for post:', postId);
      const data = await commentsAPI.getByPost(postId);
      console.log('Comments loaded:', data);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      showError(error.message || 'فشل تحميل التعليقات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول لإضافة تعليق');
      return;
    }

    if (!newComment.trim() || newComment.trim().length < 2) {
      showError('يرجى كتابة تعليق ذي معنى');
      return;
    }

    try {
      setSubmitting(true);
      await commentsAPI.create({
        postId,
        content: newComment.trim(),
      });
      
      setNewComment('');
      success('تم إضافة التعليق بنجاح');
      loadComments();
    } catch (error) {
      showError(error.message || 'فشل إضافة التعليق');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالتعليق');
      return;
    }

    try {
      await commentsAPI.like(commentId);
      loadComments();
      success('تم الإعجاب بالتعليق');
    } catch (error) {
      showError(error.message || 'فشل الإعجاب بالتعليق');
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await commentsAPI.delete(commentToDelete);
      success('تم حذف التعليق بنجاح');
      loadComments();
    } catch (error) {
      showError(error.message || 'فشل حذف التعليق');
    } finally {
      setShowDeleteDialog(false);
      setCommentToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 border border-[var(--border-color)]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          التعليقات ({comments.length})
        </h2>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                rows="3"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane ml-2"></i>
                    نشر
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 text-center mb-8">
          <p className="text-[var(--text-secondary)] mb-4">
            سجل الدخول لإضافة تعليق
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            تسجيل الدخول
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-comments text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <p className="text-[var(--text-secondary)]">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onLike={() => handleLikeComment(comment._id)}
              onDelete={() => handleDeleteComment(comment._id)}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="حذف التعليق"
        message="هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={confirmDeleteComment}
        onCancel={() => {
          setShowDeleteDialog(false);
          setCommentToDelete(null);
        }}
      />
    </>
  );
};

export default CommentSection;
