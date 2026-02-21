import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      title: 'جدولة جلسة',
      icon: 'fa-calendar-plus',
      color: 'bg-blue-500',
      link: '/therapist/sessions/new',
    },
    {
      title: 'إضافة عميل',
      icon: 'fa-user-plus',
      color: 'bg-green-500',
      link: '/therapist/clients/new',
    },
    {
      title: 'التقارير',
      icon: 'fa-file-alt',
      color: 'bg-purple-500',
      link: '/therapist/reports',
    },
    {
      title: 'الرسائل',
      icon: 'fa-comments',
      color: 'bg-amber-500',
      link: '/therapist/messages',
      badge: 2,
    },
    {
      title: 'التحليلات',
      icon: 'fa-chart-line',
      color: 'bg-pink-500',
      link: '/therapist/analytics',
    },
    {
      title: 'أوقات التوفر',
      icon: 'fa-clock',
      color: 'bg-teal-500',
      link: '/therapist/availability',
    },
  ];

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 h-full">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الوصول السريع</h2>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="relative p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors group"
          >
            <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <i className={`fas ${action.icon} text-lg`}></i>
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              {action.title}
            </div>
            {action.badge && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
