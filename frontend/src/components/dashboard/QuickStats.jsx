import React from 'react';
import { Link } from 'react-router-dom';

const QuickStats = ({ stats }) => {
  const statCards = [
    {
      title: 'جلسات اليوم',
      value: stats?.sessionsToday || 0,
      icon: 'fa-calendar-day',
      color: 'from-blue-500 to-blue-600',
      link: '/therapist/sessions',
    },
    {
      title: 'طلبات معلقة',
      value: stats?.pendingRequests || 0,
      icon: 'fa-clock',
      color: 'from-amber-500 to-amber-600',
      link: '/therapist/sessions?status=pending',
    },
    {
      title: 'إجمالي العملاء',
      value: stats?.activeClients || 0,
      icon: 'fa-users',
      color: 'from-green-500 to-green-600',
      link: '/therapist/clients',
    },
    {
      title: 'التقييم',
      value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : '—',
      icon: 'fa-star',
      color: 'from-purple-500 to-purple-600',
      link: '/therapist/reviews',
      secondary: stats?.totalReviews ? `${stats.totalReviews} مراجعة` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Link
          key={index}
          to={stat.link}
          className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-300`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            {stat.secondary && (
              <span className="text-xs text-[var(--text-secondary)]">{stat.secondary}</span>
            )}
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            {stat.title}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default QuickStats;
