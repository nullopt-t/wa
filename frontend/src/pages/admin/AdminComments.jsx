import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { commentsAPI } from '../../services/communityApi.js';

const AdminComments = () => {
  const { success, error: showError } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getAll();
      // Handle different API response structures
      const commentsList = data.comments || data.data || data;
      setComments(Array.isArray(commentsList) ? commentsList : []);
    } catch (error) {
      showError('فشل تحميل التعليقات');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await commentsAPI.delete(commentToDelete._id);
      success('تم حذف التعليق بنجاح');
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
      loadComments();
    } catch (error) {
      showError('فشل حذف التعليق');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCommentToDelete(null);
  };

  const handleApprove = async (commentId) => {
    try {
      // TODO: Replace with actual API call
      success('تم اعتماد التعليق بنجاح');
      loadComments();
    } catch (error) {
      showError('فشل اعتماد التعليق');
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filterType === 'all') return true;
    return comment.status === filterType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">معتمد</span>;
      case 'reported':
        return <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">مبلغ عنه</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">قيد المراجعة</span>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="إدارة التعليقات">
      {/* Filters */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType('reported')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterType === 'reported'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            <i className="fas fa-flag ml-2"></i>
            مبلغ عنه
          </button>
          <button
            onClick={() => setFilterType('approved')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterType === 'approved'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            معتمد
          </button>
        </div>
      </AnimatedItem>

      {/* Comments List */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30">
              <i className="fas fa-comments text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد تعليقات</h3>
              <p className="text-[var(--text-secondary)]">جميع التعليقات تمت مراجعتها</p>
            </div>
          ) : (
            filteredComments.map((comment, index) => (
              <AnimatedItem key={comment._id} type="slideUp" delay={index * 0.05}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {comment.author.firstName} {comment.author.lastName}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          على: {comment.postTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(comment.status)}
                    </div>
                  </div>
                  <p className="text-[var(--text-primary)] mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                    {comment.content}
                  </p>
                  <div className="flex justify-end gap-2">
                    {comment.status === 'reported' && (
                      <button
                        onClick={() => handleApprove(comment._id)}
                        className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-check"></i>
                        اعتماد
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(comment)}
                      className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                    >
                      <i className="fas fa-trash"></i>
                      حذف
                    </button>
                  </div>
                </div>
              </AnimatedItem>
            ))
          )}
        </div>
      </AnimatedItem>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف التعليق"
        message="هل أنت متأكد من حذف هذا التعليق؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </AdminLayout>
  );
};

export default AdminComments;
