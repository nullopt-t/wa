import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { commentsAPI } from '../../services/communityApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import CommentCard from './CommentCard.jsx';
import ConfirmDialog from '../ConfirmDialog.jsx';
import CommentTree from './CommentTree.jsx';
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Notify parent of comments count change
  useEffect(() => {
    if (onCommentsChange) {
      onCommentsChange(postId, comments.length);
    }
  }, [comments.length, postId, onCommentsChange]);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
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
      const result = await commentsAPI.like(commentId);
      
      // Recursively update comments tree with new likes
      const updateCommentLikes = (comments) => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: result.likes || [],
            };
          }
          // Recursively update nested replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies),
            };
          }
          return comment;
        });
      };
      
      setComments(updateCommentLikes(comments));
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

    setDeletingCommentId(commentToDelete);
    setShowDeleteDialog(false);

    try {
      await commentsAPI.delete(commentToDelete);
      success('تم حذف التعليق بنجاح');
      loadComments();
    } catch (error) {
      showError(error.message || 'فشل حذف التعليق');
    } finally {
      setDeletingCommentId(null);
      setCommentToDelete(null);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    // Don't set isEditing here - it's only for API loading state
  };

  // Check if current user is the post author
  const isCurrentUserPostAuthor = postAuthorId && user && (postAuthorId === user.id || postAuthorId === user._id);

  const submitEditComment = async (e) => {
    e.preventDefault();
    
    if (!editContent.trim() || !editingComment) {
      console.error('Invalid edit data:', { editContent, editingComment });
      showError('يرجى كتابة تعليق صحيح');
      return;
    }

    // Check if content actually changed
    if (editContent.trim() === editingComment.content) {
      showError('لم يتم تغيير أي شيء');
      cancelEdit();
      return;
    }

    console.log('Submitting edit:', {
      commentId: editingComment._id,
      postId,
      content: editContent.trim(),
    });

    try {
      setIsEditing(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 10000)
      );
      
      const response = await Promise.race([
        commentsAPI.update(editingComment._id, {
          content: editContent.trim(),
        }, postId),
        timeoutPromise
      ]);
      
      console.log('Edit response:', response);
      success('تم تعديل التعليق بنجاح');
      loadComments();
      cancelEdit();
    } catch (error) {
      console.error('Edit failed:', error);
      showError(error.message || 'فشل تعديل التعليق');
      setIsEditing(false); // Ensure we reset loading state
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    setIsEditing(false);
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const submitReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim() || !replyingTo) {
      showError('يرجى كتابة رد');
      return;
    }

    try {
      setSubmittingReply(true);
      await commentsAPI.create({
        postId,
        parentId: replyingTo._id,
        content: replyContent.trim(),
      });
      success('تم إضافة الرد بنجاح');
      setReplyContent('');
      loadComments();
      cancelReply();
    } catch (error) {
      showError(error.message || 'فشل إضافة الرد');
    } finally {
      setSubmittingReply(false);
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
          {comments.map((comment) => (
            <CommentTree 
              key={comment._id} 
              comment={comment} 
              depth={0}
              onLike={handleLikeComment}
              onDelete={handleDeleteComment}
              onEdit={handleEditComment}
              onReply={handleReply}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              submitReply={submitReply}
              cancelReply={cancelReply}
              submittingReply={submittingReply}
              isAuthenticated={isAuthenticated}
              deletingCommentId={deletingCommentId}
              isPostAuthor={isCurrentUserPostAuthor}
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

      {/* Edit Comment Modal */}
      {editingComment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelEdit}
          ></div>

          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">تعديل التعليق</h3>
              <button
                onClick={cancelEdit}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={submitEditComment}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="اكتب تعليقك..."
                rows="4"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none mb-4"
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isEditing || !editContent.trim()}
                  className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {isEditing ? (
                    <>
                      <i className="fas fa-spinner fa-spin ml-2"></i>
                      جاري...
                    </>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentSection;
