import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Welcome Banner */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <section className="py-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً، {user?.firstName} {user?.lastName}</h1>
              <p className="text-xl opacity-90">نأمل أن تكون في يوم جميل ونفسي مريح</p>
            </div>
          </div>
        </section>
      </AnimatedItem>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Account Info */}
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">معلومات الحساب</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]/30">
                  <span className="text-[var(--text-secondary)]">الاسم</span>
                  <span className="text-[var(--text-primary)] font-medium">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]/30">
                  <span className="text-[var(--text-secondary)]">البريد الإلكتروني</span>
                  <span className="text-[var(--text-primary)] font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]/30">
                  <span className="text-[var(--text-secondary)]">نوع الحساب</span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {user?.role === 'therapist' ? 'معالج' : 'مستخدم'}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
