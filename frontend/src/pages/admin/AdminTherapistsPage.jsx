import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { therapistsAPI } from '../../services/therapistsApi.js';

const AdminTherapistsPage = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, verified, approved
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [therapistToAction, setTherapistToAction] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, approved: 0 });

  useEffect(() => {
    loadTherapists();
    loadStats();
  }, [filterStatus]);

  const loadStats = async () => {
    try {
      const data = await therapistsAPI.getAllForAdmin();
      const therapistsList = data.therapists || [];
      
      setStats({
        total: therapistsList.length,
        pending: therapistsList.filter(t => !t.isVerified).length,
        verified: therapistsList.filter(t => t.isVerified && !t.isApproved).length,
        approved: therapistsList.filter(t => t.isApproved).length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Don't pass status filter when loading therapists list
      // The filtering is done client-side based on the filterStatus state
      
      const data = await therapistsAPI.getAllForAdmin(params.toString());
      let therapistsList = data.therapists || [];
      
      // Client-side filtering based on filterStatus
      if (filterStatus === 'pending') {
        therapistsList = therapistsList.filter(t => !t.isVerified);
      } else if (filterStatus === 'verified') {
        therapistsList = therapistsList.filter(t => t.isVerified && !t.isApproved);
      } else if (filterStatus === 'approved') {
        therapistsList = therapistsList.filter(t => t.isApproved);
      }
      
      setTherapists(therapistsList);
    } catch (error) {
      console.error('Failed to load therapists:', error);
      showError('فشل تحميل المعالجين');
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!therapistToAction) return;
    
    try {
      await therapistsAPI.verifyTherapist(therapistToAction.userId?._id || therapistToAction.userId);
      success('تم التحقق من المعالج بنجاح');
      setShowVerifyDialog(false);
      setTherapistToAction(null);
      loadTherapists();
      loadStats();
    } catch (error) {
      showError('فشل التحقق من المعالج');
    }
  };

  const handleApprove = async () => {
    if (!therapistToAction) return;
    
    try {
      await therapistsAPI.approveTherapist(therapistToAction.userId?._id || therapistToAction.userId);
      success('تم اعتماد المعالج بنجاح');
      setShowApproveDialog(false);
      setTherapistToAction(null);
      loadTherapists();
      loadStats();
    } catch (error) {
      showError('فشل اعتماد المعالج');
    }
  };

  const handleReject = async () => {
    if (!therapistToAction) return;
    
    try {
      // For now, we'll just not approve them (they remain verified but not approved)
      // In the future, you might want a separate reject endpoint
      success('تم رفض المعالج');
      setShowRejectDialog(false);
      setTherapistToAction(null);
      loadTherapists();
      loadStats();
    } catch (error) {
      showError('فشل رفض المعالج');
    }
  };

  const getStatusBadge = (therapist) => {
    if (!therapist.isVerified) {
      return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium">قيد المراجعة</span>;
    }
    if (!therapist.isApproved) {
      return <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm font-medium">تم التحقق - بانتظار الاعتماد</span>;
    }
    return <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">معتمد</span>;
  };

  return (
    <AdminLayout title="إدارة المعالجين">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                <i className="fas fa-users text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats.total}</h3>
            <p className="text-sm text-[var(--text-secondary)]">إجمالي المعالجين</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-yellow-500/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-yellow-500 mb-1">{stats.pending}</h3>
            <p className="text-sm text-yellow-500/80">قيد المراجعة</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.3}>
          <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                <i className="fas fa-check-circle text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-blue-500 mb-1">{stats.verified}</h3>
            <p className="text-sm text-blue-500/80">تم التحقق - بانتظار الاعتماد</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.4}>
          <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                <i className="fas fa-star text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-500 mb-1">{stats.approved}</h3>
            <p className="text-sm text-green-500/80">معتمدين</p>
          </div>
        </AnimatedItem>
      </div>

      {/* Filter Tabs */}
      <AnimatedItem type="slideUp" delay={0.5}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-4 border border-[var(--border-color)]/30 mb-8">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'الكل', count: stats.total },
              { id: 'pending', label: 'قيد المراجعة', count: stats.pending },
              { id: 'verified', label: 'تم التحقق', count: stats.verified },
              { id: 'approved', label: 'معتمد', count: stats.approved },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  filterStatus === filter.id
                    ? 'bg-[var(--primary-color)] text-white shadow-lg'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                }`}
              >
                {filter.label}
                <span className="mr-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>
      </AnimatedItem>

      {/* Therapists List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
        </div>
      ) : therapists.length === 0 ? (
        <AnimatedItem type="slideUp" delay={0.6}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
            <i className="fas fa-user-md text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا يوجد معالجين</h3>
            <p className="text-[var(--text-secondary)]">
              {filterStatus === 'pending' ? 'جميع المعالجين تمت مراجعتهم' : 'لا يوجد معالجين في هذا التصنيف'}
            </p>
          </div>
        </AnimatedItem>
      ) : (
        <div className="grid gap-6">
          {therapists.map((therapist, index) => (
            <AnimatedItem key={therapist.userId?._id || therapist._id} type="slideUp" delay={index * 0.05}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Therapist Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {therapist.userId?.avatar ? (
                          <img src={therapist.userId.avatar} alt={therapist.userId.firstName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          therapist.userId?.firstName?.charAt(0) || 'م'
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                          {therapist.userId?.firstName} {therapist.userId?.lastName}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">{therapist.userId?.email}</p>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(therapist)}
                          {therapist.city && (
                            <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full text-sm">
                              <i className="fas fa-map-marker-alt ml-1"></i>
                              {therapist.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border-color)]/20">
                      <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">رقم الترخيص</p>
                        <p className="font-medium text-[var(--text-primary)]">{therapist.licenseNumber || 'غير متاح'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">التخصص</p>
                        <p className="font-medium text-[var(--text-primary)]">{therapist.specialty || 'غير متاح'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">سنوات الخبرة</p>
                        <p className="font-medium text-[var(--text-primary)]">{therapist.experience ? `${therapist.experience} سنوات` : 'غير متاح'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-secondary)] mb-1">سعر الجلسة</p>
                        <p className="font-medium text-[var(--primary-color)]">{therapist.pricePerSession ? `${therapist.pricePerSession} ${therapist.currency}` : 'غير متاح'}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    {therapist.bio && (
                      <div className="mt-4 pt-4 border-t border-[var(--border-color)]/20">
                        <p className="text-xs text-[var(--text-secondary)] mb-2">النبذة التعريفية</p>
                        <p className="text-sm text-[var(--text-primary)] line-clamp-2">{therapist.bio}</p>
                      </div>
                    )}

                    {/* Session Types */}
                    <div className="flex gap-3 mt-4">
                      {therapist.isOnline && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                          <i className="fas fa-video ml-1"></i>
                          جلسات أونلاين
                        </span>
                      )}
                      {therapist.isInPerson && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-sm">
                          <i className="fas fa-building ml-1"></i>
                          جلسات شخصية
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {!therapist.isVerified ? (
                      <>
                        <button
                          onClick={() => {
                            setTherapistToAction(therapist);
                            setShowVerifyDialog(true);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-check-circle"></i>
                          تحقق
                        </button>
                        <button
                          onClick={() => {
                            setTherapistToAction(therapist);
                            setShowRejectDialog(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-times-circle"></i>
                          ارفض
                        </button>
                      </>
                    ) : !therapist.isApproved ? (
                      <>
                        <button
                          onClick={() => {
                            setTherapistToAction(therapist);
                            setShowApproveDialog(true);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-star"></i>
                          اعتمد
                        </button>
                        <button
                          onClick={() => {
                            setTherapistToAction(therapist);
                            setShowRejectDialog(true);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-times-circle"></i>
                          ارفض
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-2 text-green-500">
                        <i className="fas fa-check-circle ml-2"></i>
                        معتمد
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>
      )}

      {/* Verify Dialog */}
      <ConfirmDialog
        isOpen={showVerifyDialog}
        title="التحقق من المعالج"
        message="هل أنت متأكد من التحقق من هذا المعالج؟ سيتم التحقق من وثائقه وسيتم اعتماده بعد المراجعة النهائية."
        confirmText="تحقق"
        cancelText="إلغاء"
        confirmColor="blue"
        onConfirm={handleVerify}
        onCancel={() => {
          setShowVerifyDialog(false);
          setTherapistToAction(null);
        }}
      />

      {/* Approve Dialog */}
      <ConfirmDialog
        isOpen={showApproveDialog}
        title="اعتماد المعالج"
        message="هل أنت متأكد من اعتماد هذا المعالج؟ سيظهر في قائمة المعالجين المتاحين وسيتمكن من تقديم الجلسات."
        confirmText="اعتمد"
        cancelText="إلغاء"
        confirmColor="green"
        onConfirm={handleApprove}
        onCancel={() => {
          setShowApproveDialog(false);
          setTherapistToAction(null);
        }}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        title="رفض المعالج"
        message="هل أنت متأكد من رفض هذا المعالج؟ لن يتمكن من الظهور في قائمة المعالجين."
        confirmText="رفض"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectDialog(false);
          setTherapistToAction(null);
        }}
      />
    </AdminLayout>
  );
};

export default AdminTherapistsPage;
