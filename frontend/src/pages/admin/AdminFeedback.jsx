import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { feedbackAPI } from '../../services/feedbackApi.js';

const AdminFeedback = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [filterCategory, setFilterCategory] = useState('all'); // all, praise, suggestion, complaint, technical, other
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    loadFeedbacks();
    loadStats();
  }, [filterStatus, filterCategory]);

  const loadStats = async () => {
    try {
      const response = await feedbackAPI.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === 'all' ? '' : `&status=${filterStatus}`;
      const categoryParam = filterCategory === 'all' ? '' : `&category=${filterCategory}`;
      const response = await feedbackAPI.getAll(1, 100, filterStatus === 'all' ? undefined : filterStatus, filterCategory === 'all' ? undefined : filterCategory);
      
      let feedbacksList = response.data || [];
      
      // Filter by search term
      if (searchTerm) {
        feedbacksList = feedbacksList.filter(fb =>
          fb.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fb.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFeedbacks(feedbacksList);
    } catch (error) {
      console.error('Failed to load feedbacks:', error);
      showError('فشل تحميل التغذية الراجعة');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFeedbacks();
  };

  const handleApprove = async (id) => {
    try {
      await feedbackAPI.updateStatus(id, { status: 'approved' });
      success('تم اعتماد الملاحظة');
      loadFeedbacks();
      loadStats();
    } catch (error) {
      showError('فشل اعتماد الملاحظة');
    }
  };

  const handleReject = async (id) => {
    try {
      await feedbackAPI.updateStatus(id, { status: 'rejected' });
      success('تم رفض الملاحظة');
      loadFeedbacks();
      loadStats();
    } catch (error) {
      showError('فشل رفض الملاحظة');
    }
  };

  const handleDeleteClick = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await feedbackAPI.delete(feedbackToDelete._id);
      success('تم حذف الملاحظة بنجاح');
      setShowDeleteConfirm(false);
      setFeedbackToDelete(null);
      loadFeedbacks();
      loadStats();
    } catch (error) {
      showError('فشل حذف الملاحظة');
    }
  };

  const handleResponseClick = (feedback) => {
    setSelectedFeedback(feedback);
    setAdminResponse(feedback.adminResponse || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    try {
      await feedbackAPI.updateStatus(selectedFeedback._id, {
        status: selectedFeedback.status,
        adminResponse,
      });
      success('تم إرسال الرد بنجاح');
      setShowResponseModal(false);
      setSelectedFeedback(null);
      setAdminResponse('');
      loadFeedbacks();
    } catch (error) {
      showError('فشل إرسال الرد');
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-500 border-red-500/30',
    };
    return colors[status] || colors.pending;
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      praise: 'bg-green-500/20 text-green-500',
      suggestion: 'bg-blue-500/20 text-blue-500',
      complaint: 'bg-orange-500/20 text-orange-500',
      technical: 'bg-purple-500/20 text-purple-500',
      other: 'bg-gray-500/20 text-gray-500',
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      praise: 'مديح',
      suggestion: 'اقتراحات',
      complaint: 'شكاوى',
      technical: 'مشاكل تقنية',
      other: 'أخرى',
    };
    return labels[category] || category;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">إدارة التغذية الراجعة</h1>
          <p className="text-[var(--text-secondary)]">مراجعة والرد على ملاحظات المستخدمين</p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="text-3xl font-bold text-[var(--text-primary)]">{stats.total}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">الإجمالي</div>
            </div>
            <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
              <div className="text-sm text-yellow-500 mt-1">قيد المراجعة</div>
            </div>
            <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/30">
              <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
              <div className="text-sm text-green-500 mt-1">معتمدة</div>
            </div>
            <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
              <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
              <div className="text-sm text-red-500 mt-1">مرفوضة</div>
            </div>
            <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
              <div className="text-3xl font-bold text-[var(--primary-color)]">{stats.averageRating}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">متوسط التقييم</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">الحالة</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="all">الكل</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">معتمدة</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">الفئة</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              >
                <option value="all">الكل</option>
                <option value="praise">مديح</option>
                <option value="suggestion">اقتراحات</option>
                <option value="complaint">شكاوى</option>
                <option value="technical">مشاكل تقنية</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">البحث</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="الاسم، البريد، المحتوى..."
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-search ml-2"></i>
                بحث
              </button>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              الملاحظات ({feedbacks.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <i className="fas fa-inbox text-4xl mb-4"></i>
              <p>لا توجد ملاحظات للعرض</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {feedbacks.map((feedback, index) => (
                <AnimatedItem key={feedback._id} type="slideUp" delay={index * 0.05}>
                  <div className="p-6 hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas ${i < feedback.rating ? 'fa-star text-amber-500' : 'fa-star-o text-gray-400'}`}
                              ></i>
                            ))}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor(feedback.category)}`}>
                            {getCategoryLabel(feedback.category)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(feedback.status)}`}>
                            {feedback.status === 'pending' ? 'قيد المراجعة' : feedback.status === 'approved' ? 'معتمدة' : 'مرفوضة'}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="font-bold text-[var(--text-primary)]">{feedback.name}</div>
                          <div className="text-sm text-[var(--text-secondary)]">{feedback.email}</div>
                          <div className="text-xs text-[var(--text-secondary)]">
                            {new Date(feedback.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <p className="text-[var(--text-primary)] mb-3 leading-relaxed">
                          {feedback.content}
                        </p>

                        {feedback.adminResponse && (
                          <div className="mt-3 p-3 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <i className="fas fa-reply text-[var(--primary-color)]"></i>
                              <span className="font-bold text-sm text-[var(--primary-color)]">رد الإدارة</span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">{feedback.adminResponse}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {feedback.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(feedback._id)}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              <i className="fas fa-check ml-1"></i>
                              اعتماد
                            </button>
                            <button
                              onClick={() => handleReject(feedback._id)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              <i className="fas fa-times ml-1"></i>
                              رفض
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleResponseClick(feedback)}
                          className="px-3 py-1.5 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors text-sm"
                        >
                          <i className="fas fa-comment ml-1"></i>
                          رد
                        </button>
                        <button
                          onClick={() => handleDeleteClick(feedback)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          <i className="fas fa-trash ml-1"></i>
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
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف الملاحظة"
        message="هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setFeedbackToDelete(null);
        }}
      />

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">الرد على الملاحظة</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="font-bold text-[var(--text-primary)]">{selectedFeedback.name}</div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas ${i < selectedFeedback.rating ? 'fa-star text-amber-500' : 'fa-star-o text-gray-400'}`}
                    ></i>
                  ))}
                </div>
              </div>
              <p className="text-[var(--text-secondary)]">{selectedFeedback.content}</p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-4">ردك</label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] resize-none"
                rows="5"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitResponse}
                className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors"
              >
                إرسال الرد
              </button>
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--border-color)] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFeedback;
