import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { therapistAPI } from '../services/therapistApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { useQuery } from '@tanstack/react-query';
import AnimatedItem from '../components/AnimatedItem.jsx';

// Dashboard Components
import WelcomeBanner from '../components/dashboard/WelcomeBanner.jsx';
import QuickStats from '../components/dashboard/QuickStats.jsx';
import TodaySessions from '../components/dashboard/TodaySessions.jsx';
import QuickActions from '../components/dashboard/QuickActions.jsx';
import RecentClients from '../components/dashboard/RecentClients.jsx';
import EarningsCard from '../components/dashboard/EarningsCard.jsx';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton.jsx';

const TherapistDashboard = () => {
  const { user, loading, initialized } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a therapist (only after initialized)
  useEffect(() => {
    if (initialized && (!user || user.role !== 'therapist')) {
      navigate('/login');
    }
  }, [user, initialized, navigate]);

  // Fetch dashboard data with React Query
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['therapistDashboard', user?.id],
    queryFn: async () => {
      const data = await therapistAPI.getDashboard();
      return data;
    },
    enabled: !!user && user.role === 'therapist' && initialized,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Show error toast on API failure
  useEffect(() => {
    if (isError && error) {
      showError(error.message || 'فشل تحميل بيانات لوحة التحكم');
    }
  }, [isError, error, showError]);

  // Update page title
  useEffect(() => {
    if (dashboardData?.therapist) {
      document.title = `لوحة التحكم - ${dashboardData.therapist.firstName} ${dashboardData.therapist.lastName} | منصة وعي`;
    }
  }, [dashboardData]);

  // Show loading skeleton
  if (loading || isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error if data fetch failed
  if (isError || !dashboardData) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-5xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            فشل تحميل البيانات
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {error?.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-redo"></i>
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <i className="fas fa-home ml-2"></i>
              الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { therapist, stats, todaySessions, recentClients } = dashboardData;

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Last Updated Info */}
        <div className="flex justify-between items-center mb-6 text-sm text-[var(--text-secondary)]">
          <span>
            <i className="fas fa-clock ml-1"></i>
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs">
            <i className="fas fa-database ml-1"></i>
            البيانات محدثة تلقائياً كل 5 دقائق
          </span>
        </div>

        {/* Welcome Banner */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <WelcomeBanner therapist={therapist} stats={stats} />
        </AnimatedItem>

        {/* Quick Stats Cards */}
        <div className="mt-6">
          <AnimatedItem type="slideUp" delay={0.2}>
            <QuickStats stats={stats} />
          </AnimatedItem>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Sessions and Clients */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Sessions */}
            <AnimatedItem type="slideUp" delay={0.3}>
              <TodaySessions sessions={todaySessions} />
            </AnimatedItem>

            {/* Recent Clients */}
            <AnimatedItem type="slideUp" delay={0.4}>
              <RecentClients clients={recentClients} />
            </AnimatedItem>
          </div>

          {/* Right Column - Actions and Earnings */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <AnimatedItem type="slideLeft" delay={0.3}>
              <QuickActions />
            </AnimatedItem>

            {/* Earnings Card */}
            <AnimatedItem type="slideLeft" delay={0.4}>
              <EarningsCard stats={stats} />
            </AnimatedItem>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistDashboard;
