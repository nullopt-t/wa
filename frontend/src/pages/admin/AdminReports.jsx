import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { apiRequest } from '../../api.js';

const AdminReports = () => {
  const { success, error: showError } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, reviewed, rejected, all
  const [filterType, setFilterType] = useState('all'); // all, comment, post
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === 'all' ? '' : `&status=${filterStatus}`;
      const data = await apiRequest(`/community/reports?limit=100${statusParam}`, { method: 'GET' });
      const reportsList = data.reports || data.data || [];
      setReports(reportsList);
    } catch (error) {
      console.error('Failed to load reports:', error);
      showError('فشل تحميل البلاغات');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Delete the reported content
      let endpoint = '';
      if (reportToDelete.targetType === 'comment') {
        endpoint = `/community/comments/${reportToDelete.targetId}`;
      } else if (reportToDelete.targetType === 'post') {
        endpoint = `/community/posts/${reportToDelete.targetId}`;
      }
      
      await apiRequest(endpoint, { method: 'DELETE' });
      
      // Mark THIS report as reviewed
      await apiRequest(`/community/reports/${reportToDelete._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewed' }),
      });
      
      // Delete ALL other reports for the same content (to prevent orphaned reports)
      const allReports = await apiRequest('/community/reports?limit=1000', { method: 'GET' });
      const relatedReports = (allReports.reports || []).filter(
        r => r.targetId === reportToDelete.targetId && r._id !== reportToDelete._id
      );
      
      // Mark all related reports as reviewed
      for (const report of relatedReports) {
        await apiRequest(`/community/reports/${report._id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'reviewed' }),
        });
      }
      
      success('تم حذف المحتوى المبلغ عنه بنجاح');
      setShowDeleteConfirm(false);
      setReportToDelete(null);
      loadReports();
    } catch (error) {
      showError('فشل الحذف');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setReportToDelete(null);
  };

  const handleApprove = async (reportId) => {
    try {
      // Just mark as reviewed (content is fine)
      await apiRequest(`/community/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewed' }),
      });
      success('تمت مراجعة البلاغ وإغلاقه');
      loadReports();
    } catch (error) {
      showError('فشل تحديث البلاغ');
    }
  };

  const filteredReports = reports.filter(report => {
    // Filter by type
    if (filterType !== 'all' && report.targetType !== filterType) return false;
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const reporterName = `${report.reporterId?.firstName || ''} ${report.reporterId?.lastName || ''}`.toLowerCase();
      const reasonText = report.reason?.toLowerCase() || '';
      const descriptionText = report.description?.toLowerCase() || '';
      return reporterName.includes(search) || reasonText.includes(search) || descriptionText.includes(search);
    }
    
    return true;
  });

  const getTargetTypeBadge = (type) => {
    switch (type) {
      case 'comment':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded-full">تعليق</span>;
      case 'post':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs rounded-full">منشور</span>;
      default:
        return null;
    }
  };

  const getViewLink = (report) => {
    // For posts, open the post page
    if (report.targetType === 'post') {
      return `/community/post/${report.targetId}`;
    }
    // For comments, we'll show a modal instead
    return '#';
  };

  const handleViewClick = (report) => {
    if (report.targetType === 'comment') {
      // Show comment in modal
      setSelectedComment(report);
      setShowCommentModal(true);
    } else if (report.targetType === 'post') {
      // Open post page in new tab
      window.open(`/community/post/${report.targetId}`, '_blank');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">قيد المراجعة</span>;
      case 'reviewed':
        return <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">تمت المراجعة</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs rounded-full">مرفوض</span>;
      default:
        return null;
    }
  };

  const getReasonText = (reason) => {
    const reasons = {
      spam: 'محتوى مزعج',
      inappropriate: 'محتوى غير لائق',
      harassment: 'تحرش أو تنمر',
      misinformation: 'معلومات خاطئة',
      copyright: 'انتهاك حقوق النشر',
      other: 'أخرى',
    };
    return reasons[reason] || reason;
  };

  return (
    <AdminLayout title="إدارة البلاغات">
      {/* Filters */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                حالة البلاغ
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              >
                <option value="pending">قيد المراجعة ⏳</option>
                <option value="reviewed">تمت المراجعة ✅</option>
                <option value="rejected">مرفوض ❌</option>
                <option value="all">الكل</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                نوع المحتوى
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              >
                <option value="all">الكل</option>
                <option value="comment">تعليقات 💬</option>
                <option value="post">منشورات 📝</option>
              </select>
            </div>
            
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                بحث
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم المبلغ أو السبب..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              />
            </div>
          </div>
          
          {/* Results Counter & Clear */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-[var(--text-secondary)]">
              عرض {filteredReports.length} من {reports.length} بلاغات
            </p>
            {(filterStatus !== 'pending' || filterType !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setFilterStatus('pending');
                  setFilterType('all');
                  setSearchTerm('');
                }}
                className="text-sm text-[var(--primary-color)] hover:underline"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      </AnimatedItem>

      {/* Reports List */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30">
              <i className="fas fa-flag-checkered text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد بلاغات</h3>
              <p className="text-[var(--text-secondary)]">جميع البلاغات تمت مراجعتها</p>
            </div>
          ) : (
            filteredReports.map((report, index) => (
              <AnimatedItem key={report._id} type="slideUp" delay={index * 0.05}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                        <i className="fas fa-flag"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <p className="font-bold text-[var(--text-primary)] text-lg">
                            {report.reporterId?.firstName} {report.reporterId?.lastName}
                          </p>
                          {getTargetTypeBadge(report.targetType)}
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          <i className="far fa-clock ml-1"></i>
                          {new Date(report.createdAt).toLocaleDateString('ar-EG', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-[var(--primary-color)] mt-2">
                          <i className="fas fa-exclamation-circle ml-1"></i>
                          السبب: {getReasonText(report.reason)}
                        </p>
                        {report.description && (
                          <p className="text-sm text-[var(--text-secondary)] mt-2 bg-[var(--bg-secondary)] p-3 rounded-lg">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]/20">
                    <button
                      onClick={() => handleViewClick(report)}
                      className="px-4 py-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/20 transition-colors flex items-center gap-2 font-medium"
                    >
                      <i className={`fas ${report.targetType === 'post' ? 'fa-external-link-alt' : 'fa-comment'}`}></i>
                      {report.targetType === 'post' ? 'عرض المنشور' : 'عرض التعليق'}
                    </button>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(report._id)}
                          className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors flex items-center gap-2 font-medium"
                          title="المحتوى سليم، إغلاق البلاغ"
                        >
                          <i className="fas fa-check-circle"></i>
                          المحتوى سليم
                        </button>
                        <button
                          onClick={() => handleDeleteClick(report)}
                          className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
                          title="حذف المحتوى المخالف"
                        >
                          <i className="fas fa-trash-alt"></i>
                          حذف المحتوى
                        </button>
                      </div>
                    )}
                    {report.status === 'reviewed' && (
                      <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                        <i className="fas fa-info-circle"></i>
                        تمت مراجعة هذا البلاغ
                      </span>
                    )}
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
        title="حذف المحتوى المبلغ عنه"
        message="هل أنت متأكد من حذف هذا المحتوى؟\n\nسيتم أيضاً إغلاق البلاغ."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Comment View Modal */}
      {showCommentModal && selectedComment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCommentModal(false)}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <i className="fas fa-comment text-[var(--primary-color)]"></i>
                التعليق المبلغ عنه
              </h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Comment Info */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                {selectedComment.contentSnapshot ? (
                  <>
                    <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                      {selectedComment.contentSnapshot}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
                      <i className="fas fa-check-circle text-green-500"></i>
                      تم حفظ هذا المحتوى وقت البلاغ
                    </p>
                  </>
                ) : selectedComment.content ? (
                  <>
                    <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                      {selectedComment.content}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
                      <i className="fas fa-info-circle text-blue-500"></i>
                      المحتوى ما زال موجوداً
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-trash-alt text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                    <p className="text-[var(--text-primary)] font-bold mb-2">
                      المحتوى لم يعد متاحاً
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      تم حذف هذا التعليق ولا يمكن عرضه
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      (تم إنشاء البلاغ قبل ميزة حفظ المحتوى)
                    </p>
                  </div>
                )}
              </div>

              {/* Report Details */}
              <div className="border-t border-[var(--border-color)]/30 pt-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <i className="fas fa-flag text-red-500"></i>
                  تفاصيل البلاغ
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">المبلغ:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {selectedComment.reporterId?.firstName} {selectedComment.reporterId?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">السبب:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {getReasonText(selectedComment.reason)}
                    </span>
                  </div>
                  {selectedComment.description && (
                    <div className="flex justify-between items-start">
                      <span className="text-[var(--text-secondary)]">الوصف:</span>
                      <span className="text-[var(--text-primary)] font-medium text-left">
                        {selectedComment.description}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">تاريخ البلاغ:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {new Date(selectedComment.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedComment.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]/30">
                  <button
                    onClick={() => {
                      handleApprove(selectedComment._id);
                      setShowCommentModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <i className="fas fa-check-circle"></i>
                    المحتوى سليم
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteClick(selectedComment);
                      setShowCommentModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <i className="fas fa-trash-alt"></i>
                    حذف التعليق
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
