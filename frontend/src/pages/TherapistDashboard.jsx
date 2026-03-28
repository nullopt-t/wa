import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { therapistAPI } from '../services/therapistApi.js';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const TherapistDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'therapist') {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await therapistAPI.getDashboard();
      setProfile(data.profile || data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                {user?.firstName?.charAt(0) || 'م'}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  مرحباً {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-white/90">معالج نفسي معتمد</p>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Profile Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profile?.isApproved ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  <i className={`fas ${profile?.isApproved ? 'fa-check-circle' : 'fa-clock'} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">حالة الحساب</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {profile?.isApproved ? 'معتمد ✅' : 'قيد المراجعة ⏳'}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  profile?.isVerified ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'
                }`}>
                  <i className={`fas ${profile?.isVerified ? 'fa-shield-alt' : 'fa-file'} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">الترخيص</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {profile?.licenseNumber || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem type="slideUp" delay={0.4}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary-color)]/20 text-[var(--primary-color)] flex items-center justify-center">
                  <i className="fas fa-star text-2xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">التقييم</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {profile?.averageRating ? `${profile.averageRating} ⭐` : 'لا يوجد تقييمات بعد'}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedItem>
        </div>

        {/* Profile Info */}
        <AnimatedItem type="slideUp" delay={0.5}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <i className="fas fa-user-md text-[var(--primary-color)]"></i>
              المعلومات الشخصية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <i className="fas fa-envelope ml-1"></i>
                  البريد الإلكتروني
                </label>
                <p className="text-[var(--text-primary)]">{user?.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <i className="fas fa-phone ml-1"></i>
                  رقم الهاتف
                </label>
                <p className="text-[var(--text-primary)]">{user?.phone || 'غير محدد'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <i className="fas fa-briefcase ml-1"></i>
                  سنوات الخبرة
                </label>
                <p className="text-[var(--text-primary)]">
                  {profile?.experience ? `${profile.experience} سنوات` : 'غير محدد'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <i className="fas fa-map-marker-alt ml-1"></i>
                  المدينة
                </label>
                <p className="text-[var(--text-primary)]">{profile?.city || 'غير محدد'}</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <i className="fas fa-align-right ml-1"></i>
                  النبذة التعريفية
                </label>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  {profile?.bio || 'لم يتم إضافة نبذة تعريفية بعد'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => navigate('/profile-settings')}
                className="w-full md:w-auto px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-edit"></i>
                تعديل المعلومات الشخصية
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Info Banner */}
        {!profile?.isApproved && (
          <AnimatedItem type="slideUp" delay={0.7}>
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-info-circle text-2xl text-yellow-500"></i>
                </div>
                <div>
                  <h3 className="font-bold text-yellow-700 mb-2">حسابك قيد المراجعة</h3>
                  <p className="text-yellow-600">
                    ملفك الشخصي قيد المراجعة من قبل فريق الإدارة. ستتمكن من الظهور في قائمة المعالجين وبدء استقبال الحجوزات بعد الاعتماد.
                    <br />
                    <span className="text-sm">عادةً تستغرق المراجعة من ٢-٥ أيام عمل.</span>
                  </p>
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboard;
