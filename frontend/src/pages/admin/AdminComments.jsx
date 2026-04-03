import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { apiRequest } from '../../api.js';

const AdminComments = () => {
  const { success, error: showError } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      // Fetch only reported comments (what admins need to review)
      const data = await apiRequest('/comments/admin/all?status=reported&limit=100', { method: 'GET' });
      const commentsList = data.comments || data.data || [];
      setComments(commentsList);
    } catch (error) {
      
      ;
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
      await apiRequest(`/comments/${commentToDelete._id}`, { method: 'DELETE' });
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
      await apiRequest(`/comments/admin/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active' }),
      });
      success('تم اعتماد التعليق بنجاح');
      loadComments();
    } catch (error) {
      showError('فشل اعتماد التعليق');
    }
  };

  const filteredComments = comments.filter(comment => {
    // Filter by search term only
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return comment.content?.toLowerCase().includes(search) ||
        comment.authorId?.firstName?.toLowerCase().includes(search) ||
        comment.authorId?.lastName?.toLowerCase().includes(search);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">نشط</span>;
      case 'reported':
        return <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">مبلغ عنه</span>;
      case 'deleted':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">محذوف</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">غير معروف</span>;
    }
  };

  return (
    <AdminLayout title="مراجعة التعليقات المبلغ عنها">
      {/* Search Bar */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                بحث في التعليقات
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في المحتوى أو اسم المستخدم..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              />
            </div>
            <div className="text-left">
              <p className="text-sm text-[var(--text-secondary)]">
                عرض {filteredComments.length} من {comments.length} تعليقات
              </p>
            </div>
          </div>
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
            <div className="grid gap-4">
              {filteredComments.map((comment, index) => (
                <AnimatedItem key={comment._id} type="slideUp" delay={index * 0.05}>
                  <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                          {(comment.authorId?.firstName?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[var(--text-primary)] text-lg">
                              {comment.authorId?.firstName} {comment.authorId?.lastName}
                            </p>
                            {getStatusBadge(comment.status)}
                            {comment.reports > 0 && (
                              <span className="text-xs text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded-full">
                                <i className="fas fa-flag"></i>
                                {comment.reports} تقارير
                              </span>
                            )}
                          </div>
                          {comment.authorId?.email && (
                            <p className="text-sm text-[var(--text-secondary)]">{comment.authorId.email}</p>
                          )}
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            <i className="far fa-clock ml-1"></i>
                            {new Date(comment.createdAt).toLocaleDateString('ar-EG', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="bg-[var(--bg-secondary)] rounded-2xl rounded-tr-none p-5 mb-4 border border-[var(--border-color)]/20">
                      <p className="text-[var(--text-primary)] text-base leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]/20">
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        {comment.likes > 0 && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-heart text-red-500"></i>
                            {comment.likes}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {comment.status === 'reported' && (
                          <button
                            onClick={() => handleApprove(comment._id)}
                            className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2 font-medium"
                          >
                            <i className="fas fa-check"></i>
                            اعتماد
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(comment)}
                          className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
                        >
                          <i className="fas fa-trash"></i>
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
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
