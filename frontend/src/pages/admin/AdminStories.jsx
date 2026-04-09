import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { storiesAPI } from '../../services/communityApi.js';

const AdminStories = () => {
  const { success, error: showError } = useToast();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [stats, setStats] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [storyToModerate, setStoryToModerate] = useState(null);

  const loadStories = async (status = filterStatus) => {
    try {
      setLoading(true);
      const data = await storiesAPI.getAllForAdmin({
        status: status,
        sort: 'newest'
      });
      setStories(data.stories || []);
    } catch (error) {

      showError('فشل تحميل القصص');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await storiesAPI.getStats();
      setStats({
        pending: data.pendingStories || 0,
        approved: data.approvedStories || 0,
        rejected: data.rejectedStories || 0,
        hidden: data.hiddenStories || 0,
      });
    } catch (error) {

      setStats({ pending: 0, approved: 0, rejected: 0, hidden: 0 });
    }
  };

  useEffect(() => {
    loadStories();
  }, [filterStatus]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefreshStories = useCallback(() => {
    loadStories();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!storyToModerate) return;

    try {
      await storiesAPI.moderate(storyToModerate._id, 'approved');
      success('تم اعتماد القصة بنجاح');
      setShowApproveDialog(false);
      setStoryToModerate(null);
      handleRefreshStories();
      loadStats();
    } catch (error) {
      showError('فشل اعتماد القصة');
    }
  };

  const handleReject = async () => {
    if (!storyToModerate) return;

    try {
      await storiesAPI.moderate(storyToModerate._id, 'rejected');
      success('تم رفض القصة');
      setShowRejectDialog(false);
      setStoryToModerate(null);
      handleRefreshStories();
      loadStats();
    } catch (error) {
      showError('فشل رفض القصة');
    }
  };

  const handleHide = async () => {
    if (!storyToModerate) return;

    try {
      await storiesAPI.moderate(storyToModerate._id, 'hidden');
      success('تم إخفاء القصة');
      setShowHideDialog(false);
      setStoryToModerate(null);
      handleRefreshStories();
      loadStats();
    } catch (error) {
      showError('فشل إخفاء القصة');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-500', label: 'قيد المراجعة' },
      approved: { color: 'bg-green-500/20 text-green-500', label: 'معتمدة' },
      rejected: { color: 'bg-red-500/20 text-red-500', label: 'مرفوضة' },
      hidden: { color: 'bg-gray-500/20 text-gray-500', label: 'مخفية' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categories = {
      recovery: { color: 'bg-green-500/20 text-green-500', label: 'التعافي' },
      relationships: { color: 'bg-purple-500/20 text-purple-500', label: 'العلاقات' },
      depression: { color: 'bg-blue-500/20 text-blue-500', label: 'الاكتئاب' },
      anxiety: { color: 'bg-yellow-500/20 text-yellow-500', label: 'القلق' },
      addiction: { color: 'bg-red-500/20 text-red-500', label: 'الإدمان' },
      other: { color: 'bg-gray-500/20 text-gray-500', label: 'أخرى' },
    };
    const cat = categories[category] || categories.other;
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${cat.color}`}>
        {cat.label}
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة القصص">
      {/* Filter Tabs */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-4 md:p-6 border border-[var(--border-color)]/30 mb-6">
          <div className="flex gap-2 md:gap-3 flex-wrap justify-center md:flex-nowrap">
            {[
              { id: 'pending', label: 'قيد المراجعة', icon: 'fa-clock', count: stats?.pending },
              { id: 'approved', label: 'المعتمدة', icon: 'fa-check-circle', count: stats?.approved },
              { id: 'rejected', label: 'المرفوضة', icon: 'fa-times-circle', count: stats?.rejected },
              { id: 'hidden', label: 'المخفية', icon: 'fa-eye-slash', count: stats?.hidden },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 rounded-xl font-medium transition-all flex-1 min-w-fit justify-center ${
                  filterStatus === filter.id
                    ? 'bg-[var(--primary-color)] text-white shadow-lg'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <i className={`fas ${filter.icon}`}></i>
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.count !== undefined ? filter.count : '...'}</span>
                {stats !== null ? (
                  <span className="hidden sm:inline px-2 py-0.5 bg-white/20 rounded-full text-xs">{filter.count}</span>
                ) : (
                  <span className="hidden sm:inline w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </AnimatedItem>

      {/* Stories List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
        </div>
      ) : stories.length === 0 ? (
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 md:p-12 text-center border border-[var(--border-color)]/30">
            <i className="fas fa-inbox text-5xl md:text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
            <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-2">
              لا توجد قصص
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              {filterStatus === 'pending' ? 'جميع القصص تمت مراجعتها' : 'لا توجد قصص في هذا التصنيف'}
            </p>
          </div>
        </AnimatedItem>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {stories.map((story, index) => (
            <AnimatedItem key={story._id} type="slideUp" delay={index * 0.05}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-4 md:p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0 overflow-hidden">
                      {story.authorId?.avatar ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${story.authorId.avatar}`} alt={story.authorId?.firstName} className="w-full h-full object-cover rounded-xl md:rounded-2xl" />
                      ) : (
                        story.authorId?.firstName?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] break-words max-w-full">{story.authorId?.firstName || 'مجهول'}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-[var(--text-secondary)] mt-1">
                        <span className="break-all max-w-full">{story.authorId?.email}</span>
                        <span className="flex-shrink-0">•</span>
                        <span className="whitespace-nowrap flex-shrink-0">{new Date(story.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-end flex-shrink-0">
                    {getStatusBadge(story.status)}
                    {getCategoryBadge(story.category)}
                  </div>
                </div>

                {/* Title & Content */}
                <div className="mb-6">
                  <h4 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-3 break-words max-w-full">{story.title}</h4>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-4 md:p-5 border border-[var(--border-color)]/20 max-h-64 overflow-y-auto">
                    <p className="text-sm md:text-base text-[var(--text-primary)] leading-relaxed break-words max-w-full">
                      {story.content}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-[var(--text-secondary)] mb-4 md:mb-6 pb-4 md:pb-6 border-b border-[var(--border-color)]/20">
                  <span className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    <i className="far fa-clock"></i>
                    {story.readTime} د
                  </span>
                  {story.likes?.length > 0 && (
                    <span className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                      <i className="far fa-heart"></i>
                      {story.likes.length}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {story.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowApproveDialog(true);
                      }}
                      className="flex-1 px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                      <i className="fas fa-check-circle"></i>
                      اعتماد
                    </button>
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowRejectDialog(true);
                      }}
                      className="flex-1 px-4 md:px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                      <i className="fas fa-times-circle"></i>
                      رفض
                    </button>
                  </div>
                )}

                {story.status === 'approved' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 text-center py-3 text-green-500 text-sm md:text-base">
                      <i className="fas fa-check-circle ml-2"></i>
                      معتمدة
                    </div>
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowHideDialog(true);
                      }}
                      className="flex-1 px-4 md:px-6 py-3 border-2 border-gray-500 text-gray-500 rounded-xl font-semibold hover:bg-gray-500/10 transition-all flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                      <i className="fas fa-eye-slash"></i>
                      إخفاء
                    </button>
                  </div>
                )}

                {story.status === 'rejected' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 text-center py-3 text-red-500 text-sm md:text-base">
                      <i className="fas fa-times-circle ml-2"></i>
                      مرفوضة
                    </div>
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowHideDialog(true);
                      }}
                      className="flex-1 px-4 md:px-6 py-3 border-2 border-gray-500 text-gray-500 rounded-xl font-semibold hover:bg-gray-500/10 transition-all flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                      <i className="fas fa-eye-slash"></i>
                      إخفاء
                    </button>
                  </div>
                )}

                {story.status === 'hidden' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 text-center py-3 text-gray-500 text-sm md:text-base">
                      <i className="fas fa-eye-slash ml-2"></i>
                      مخفية
                    </div>
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowApproveDialog(true);
                      }}
                      className="flex-1 px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap"
                    >
                      <i className="fas fa-check-circle"></i>
                      اعتماد
                    </button>
                  </div>
                )}
              </div>
            </AnimatedItem>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        title="اعتماد القصة"
        message="هل أنت متأكد من اعتماد هذه القصة ونشرها؟"
        confirmText="اعتماد"
        cancelText="إلغاء"
        confirmColor="green"
        onConfirm={handleApprove}
        onCancel={() => {
          setShowApproveDialog(false);
          setStoryToModerate(null);
        }}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        title="رفض القصة"
        message="هل أنت متأكد من رفض هذه القصة؟"
        confirmText="رفض"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectDialog(false);
          setStoryToModerate(null);
        }}
      />

      {/* Hide Dialog */}
      <ConfirmDialog
        isOpen={showHideDialog}
        title="إخفاء القصة"
        message="هل أنت متأكد من إخفاء هذه القصة؟ لن تظهر للمستخدمين ولكن تبقى مخزنة."
        confirmText="إخفاء"
        cancelText="إلغاء"
        confirmColor="gray"
        onConfirm={handleHide}
        onCancel={() => {
          setShowHideDialog(false);
          setStoryToModerate(null);
        }}
      />
    </AdminLayout>
  );
};

export default AdminStories;
