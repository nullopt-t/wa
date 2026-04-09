import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import ArticleForm from '../../components/articles/ArticleForm.jsx';
import { apiRequest } from '../../api.js';

const AdminArticles = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      // For admin, get all articles with all statuses
      const data = await apiRequest('/articles?limit=100&status=all', { method: 'GET' });
      const articlesList = Array.isArray(data) ? data : (data.articles || data.data || []);
      setArticles(articlesList);
    } catch (error) {
      
      showError('فشل تحميل المقالات');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiRequest(`/articles/${articleToDelete._id}`, { method: 'DELETE' });
      success('تم حذف المقال بنجاح');
      setShowDeleteConfirm(false);
      setArticleToDelete(null);
      loadArticles();
    } catch (error) {
      showError('فشل حذف المقال');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setArticleToDelete(null);
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setShowEditModal(true);
  };

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await apiRequest('/articles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      success('تم إنشاء المقال بنجاح');
      setShowCreateModal(false);
      loadArticles();
    } catch (error) {
      showError(error.message || 'فشل إنشاء المقال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (submitting) return;
    setShowCreateModal(false);
  };

  const handleUpdate = async (data) => {
    if (!editingArticle) return;

    setSubmitting(true);
    try {
      await apiRequest(`/articles/${editingArticle._id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      success('تم تحديث المقال بنجاح');
      setEditingArticle(null);
      setShowEditModal(false);
      loadArticles();
    } catch (error) {
      showError(error.message || 'فشل تحديث المقال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setShowEditModal(false);
    setEditingArticle(null);
  };

  const filteredArticles = articles.filter(article => {
    if (filterStatus === 'all') return true;
    return article.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">منشور</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">مسودة</span>;
      case 'archived':
        return <span className="px-3 py-1 bg-purple-500/20 text-purple-500 text-xs rounded-full">مؤرشف</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-500 text-xs rounded-full">غير معروف</span>;
    }
  };

  return (
    <AdminLayout title="إدارة المقالات">
      {/* Add Article Button */}
      <AnimatedItem type="slideUp" delay={0.05}>
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            إضافة مقال جديد
          </button>
        </div>
      </AnimatedItem>

      {/* Filters */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'published'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            منشور
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'draft'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            مسودة
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filterStatus === 'archived'
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
            }`}
          >
            مؤرشف
          </button>
        </div>
      </AnimatedItem>

      {/* Articles Table */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              قائمة المقالات
              <span className="mr-2 text-sm text-[var(--text-secondary)]">({filteredArticles.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">المقال</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الكاتب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">تاريخ النشر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)] mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      لا توجد مقالات
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => {
                    // Safely get article fields with fallbacks
                    const articleId = article._id || article.id || 'unknown';
                    const title = article.title || 'بدون عنوان';
                    const excerpt = article.excerpt || article.description || '';
                    const author = article.author || article.authorData || {};
                    const authorName = author.firstName && author.lastName
                      ? `${author.firstName} ${author.lastName}`
                      : (article.authorName || 'مجهول');
                    const status = article.status || 'draft';
                    const createdAt = article.createdAt;
                    
                    return (
                      <tr key={articleId} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <a
                              href={`/articles/${article.slug || article._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-[var(--primary-color)] hover:underline mb-1 block"
                            >
                              {title}
                            </a>
                            <p className="text-sm text-[var(--text-secondary)] truncate max-w-md">{excerpt}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {authorName}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(status)}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {createdAt ? new Date(createdAt).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a
                              href={`/articles/${article.slug || article._id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                              title="عرض"
                            >
                              <i className="fas fa-eye"></i>
                            </a>
                            <button
                              onClick={() => handleEditClick(article)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(article)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedItem>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف المقال"
        message={`هل أنت متأكد من حذف مقال "${articleToDelete?.title}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Edit Article Modal */}
      {showEditModal && editingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">تعديل المقال</h2>
              <button
                onClick={handleCloseModal}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <ArticleForm
                article={editingArticle}
                onSubmit={handleUpdate}
                onCancel={handleCloseModal}
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseCreateModal}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">إنشاء مقال جديد</h2>
              <button
                onClick={handleCloseCreateModal}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <ArticleForm
                article={null}
                onSubmit={handleCreate}
                onCancel={handleCloseCreateModal}
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminArticles;
