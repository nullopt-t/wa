import React from 'react';
import CommentCard from './CommentCard.jsx';

const CommentTree = ({ 
  comment, 
  depth = 0, 
  onLike, 
  onDelete, 
  onEdit, 
  onReply, 
  replyingTo, 
  replyContent, 
  setReplyContent,
  submitReply,
  cancelReply,
  submittingReply,
  isAuthenticated,
  deletingCommentId,
  isPostAuthor
}) => {
  const maxDepth = 10;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isReplyingToThis = replyingTo?._id === comment._id;

  return (
    <div className="relative">
      {/* Comment Card */}
      <div className={`${depth > 0 ? 'mt-3' : ''}`}>
        <CommentCard
          comment={comment}
          onLike={() => onLike(comment._id)}
          onDelete={() => onDelete(comment._id)}
          onEdit={onEdit}
          onReply={depth < maxDepth ? () => onReply(comment) : null}
          isAuthenticated={isAuthenticated}
          isDeleting={deletingCommentId === comment._id}
          isPostAuthor={isPostAuthor}
          isReply={depth > 0}
        />
      </div>

      {/* Reply Form */}
      {isReplyingToThis && isAuthenticated && (
        <div className="mt-3 ml-8 mr-4 p-4 bg-[var(--bg-secondary)] rounded-xl border-l-4 border-[var(--primary-color)]">
          <div className="flex items-start gap-3 mb-3">
            <i className="fas fa-reply text-[var(--primary-color)]"></i>
            <span className="text-sm text-[var(--text-secondary)]">
              رد على: {comment.authorId?.firstName || 'مجهول'}
            </span>
          </div>
          <form onSubmit={submitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="اكتب ردك..."
              rows="3"
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none mb-3"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingReply || !replyContent.trim()}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 text-sm"
              >
                {submittingReply ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane ml-2"></i>
                    نشر الرد
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelReply}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-secondary)] transition-colors text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nested Replies with Tree Lines */}
      {hasReplies && (
        <div className="mt-3 ml-6 flex">
          {/* Vertical line connecting parent to children */}
          <div 
            className="w-px mr-4"
            style={{ 
              width: '2px',
              background: `linear-gradient(to bottom, var(--primary-color) 0%, var(--border-color) 100%)`,
              minWidth: '2px'
            }}
          ></div>
          
          {/* Replies container */}
          <div className="flex-1 space-y-3">
            {comment.replies.map((reply, index) => (
              <div key={reply._id} className="relative">
                {/* Horizontal line to each reply */}
                <div 
                  className="absolute -left-4 top-6 h-px"
                  style={{
                    background: 'var(--border-color)',
                    width: '16px',
                    left: '-18px'
                  }}
                ></div>
                
                <CommentTree 
                  comment={reply} 
                  depth={depth + 1}
                  onLike={onLike}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  submitReply={submitReply}
                  cancelReply={cancelReply}
                  submittingReply={submittingReply}
                  isAuthenticated={isAuthenticated}
                  deletingCommentId={deletingCommentId}
                  isPostAuthor={isPostAuthor}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentTree;
