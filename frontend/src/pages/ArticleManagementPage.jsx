import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { articlesAPI } from '../services/communityApi.js';
import ArticleForm from '../components/articles/ArticleForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const ArticleManagementPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Check for edit query parameter AFTER articles are loaded
  useEffect(() => {
    if (!loading && articles.length > 0) {
      const editId = searchParams.get('edit');
      if (editId) {
        const articleToEdit = articles.find(a => a._id === editId);
        if (articleToEdit) {
          setEditingArticle(articleToEdit);
          setShowCreateModal(true);
          // Clear the query parameter
          navigate('/articles/manage', { replace: true });
        }
      }
    }
  }, [loading, articles, searchParams, navigate]);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await articlesAPI.getAll({ limit: 100 });
      const articlesList = data.articles || data.data || [];
      setArticles(articlesList);
    } catch (error) {
      console.error('Failed to load articles:', error);
      showError('فشل تحميل المقالات');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للوصول إلى هذه الصفحة');
      navigate('/login');
      return;
    }
    loadArticles();
  }, [isAuthenticated, loadArticles, navigate, showError]);

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      await articlesAPI.delete(articleToDelete._id);
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

  const handleCreate = useCallback(async (data) => {
    setSubmitting(true);
    try {
      await articlesAPI.create(data);
      success('تم إنشاء المقال بنجاح');
      setShowCreateModal(false);
      loadArticles();
    } catch (error) {
      showError(error.message || 'فشل إنشاء المقال');
    } finally {
      setSubmitting(false);
    }
  }, [success, showError, loadArticles]);

  const handleUpdate = useCallback(async (data) => {
    if (!editingArticle) return;

    setSubmitting(true);
    try {
      await articlesAPI.update(editingArticle._id, data);
      success('تم تحديث المقال بنجاح');
      setEditingArticle(null);
      loadArticles();
    } catch (error) {
      showError(error.message || 'فشل تحديث المقال');
    } finally {
      setSubmitting(false);
    }
  }, [editingArticle, success, showError, loadArticles]);

  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-500', label: 'مسودة' },
      published: { color: 'bg-green-500', label: 'منشور' },
      archived: { color: 'bg-blue-500', label: 'مؤرشف' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`${badge.color} text-white px-2 py-1 text-xs rounded-full`}>
        {badge.label}
      </span>
    );
  };

  const handleCloseModal = () => {
    if (submitting) return; // Don't close while submitting
    setShowCreateModal(false);
    setEditingArticle(null);
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">إدارة المقالات</h1>
              <p className="text-[var(--text-secondary)]">أنشئ وأدر مقالاتك الصحية</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              مقال جديد
            </button>
          </div>
        </AnimatedItem>

        {/* Articles List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : articles.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
              <i className="fas fa-newspaper text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد مقالات بعد</h3>
              <p className="text-[var(--text-secondary)] mb-6">ابدأ بكتابة أول مقال لك</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-pen ml-2"></i>
                اكتب مقال
              </button>
            </div>
          </AnimatedItem>
        ) : (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">العنوان</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الإعجابات</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">تاريخ النشر</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {articles.map((article) => (
                      <tr key={article._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-[var(--text-primary)] mb-1">{article.title}</p>
                            <p className="text-sm text-[var(--text-secondary)] truncate max-w-md">{article.excerpt}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(article.status)}</td>
                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                          <i className="far fa-heart ml-1"></i>
                          {Array.isArray(article.likes) ? article.likes.length : (article.likes || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/articles/${article.slug || article._id}`)}
                              className="p-2 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                              title="عرض"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => {
                                setEditingArticle(article);
                                setShowCreateModal(true);
                              }}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>

      {/* Create/Edit Article Modal */}
      {(showCreateModal || editingArticle) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={handleCloseModal}
            style={{ pointerEvents: submitting ? 'none' : 'auto' }}
          ></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {editingArticle ? 'تعديل المقال' : 'إنشاء مقال جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2 hover:bg-[var(--bg-secondary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <ArticleForm
                article={editingArticle}
                onSubmit={editingArticle ? handleUpdate : handleCreate}
                onCancel={handleCloseModal}
                disabled={submitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف المقال"
        message="هل أنت متأكد من حذف هذا المقال؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default ArticleManagementPage;
