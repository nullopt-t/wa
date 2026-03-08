import React, { useState, useEffect } from 'react';
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
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [storyToModerate, setStoryToModerate] = useState(null);

  const loadStories = async () => {
    try {
      setLoading(true);
      const data = await storiesAPI.getAllForAdmin({ 
        status: filterStatus,
        sort: 'newest'
      });
      setStories(data.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
      showError('فشل تحميل القصص');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [filterStatus]);

  const handleApprove = async () => {
    if (!storyToModerate) return;
    
    try {
      await storiesAPI.moderate(storyToModerate._id, 'approved');
      success('تم اعتماد القصة بنجاح');
      setShowApproveDialog(false);
      setStoryToModerate(null);
      loadStories();
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
      loadStories();
    } catch (error) {
      showError('فشل رفض القصة');
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
      <span className={`px-3 py-1 text-xs rounded-full font-medium ${badge.color}`}>
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
      <span className={`px-3 py-1 text-xs rounded-full font-medium ${cat.color}`}>
        {cat.label}
      </span>
    );
  };

  return (
    <AdminLayout title="إدارة القصص">
      {/* Filter Tabs */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
          <div className="flex gap-3 flex-wrap">
            {[
              { id: 'pending', label: 'قيد المراجعة', icon: 'fa-clock', count: stories.filter(s => s.status === 'pending').length },
              { id: 'approved', label: 'المعتمدة', icon: 'fa-check-circle', count: stories.filter(s => s.status === 'approved').length },
              { id: 'rejected', label: 'المرفوضة', icon: 'fa-times-circle', count: stories.filter(s => s.status === 'rejected').length },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  filterStatus === filter.id
                    ? 'bg-[var(--primary-color)] text-white shadow-lg'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <i className={`fas ${filter.icon}`}></i>
                <span>{filter.label}</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{filter.count}</span>
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
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
            <i className="fas fa-inbox text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              لا توجد قصص
            </h3>
            <p className="text-[var(--text-secondary)]">
              {filterStatus === 'pending' ? 'جميع القصص تمت مراجعتها' : 'لا توجد قصص في هذا التصنيف'}
            </p>
          </div>
        </AnimatedItem>
      ) : (
        <div className="grid gap-6">
          {stories.map((story, index) => (
            <AnimatedItem key={story._id} type="slideUp" delay={index * 0.05}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {story.authorId?.avatar ? (
                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${story.authorId.avatar}`} alt={story.authorId?.firstName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        story.authorId?.firstName?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{story.authorId?.firstName || 'مجهول'}</h3>
                      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                        <span>{story.authorId?.email}</span>
                        <span>•</span>
                        <span>{new Date(story.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(story.status)}
                    {getCategoryBadge(story.category)}
                  </div>
                </div>

                {/* Title & Content */}
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-[var(--text-primary)] mb-3">{story.title}</h4>
                  <div className="bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-color)]/20">
                    <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                      {story.content}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)] mb-6 pb-6 border-b border-[var(--border-color)]/20">
                  <span className="flex items-center gap-2">
                    <i className="far fa-eye"></i>
                    {story.views} مشاهدة
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="far fa-clock"></i>
                    {story.readTime} دقائق قراءة
                  </span>
                  {story.likes?.length > 0 && (
                    <span className="flex items-center gap-2">
                      <i className="far fa-heart"></i>
                      {story.likes.length} إعجاب
                    </span>
                  )}
                </div>

                {/* Actions */}
                {story.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowApproveDialog(true);
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-check-circle"></i>
                      اعتماد القصة
                    </button>
                    <button
                      onClick={() => {
                        setStoryToModerate(story);
                        setShowRejectDialog(true);
                      }}
                      className="flex-1 px-6 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-times-circle"></i>
                      رفض القصة
                    </button>
                  </div>
                )}

                {story.status === 'approved' && (
                  <div className="text-center py-3 text-green-500">
                    <i className="fas fa-check-circle ml-2"></i>
                    قصة معتمدة
                  </div>
                )}

                {story.status === 'rejected' && (
                  <div className="text-center py-3 text-red-500">
                    <i className="fas fa-times-circle ml-2"></i>
                    قصة مرفوضة
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
    </AdminLayout>
  );
};

export default AdminStories;
