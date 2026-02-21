import React from 'react';
import { Link } from 'react-router-dom';

const EarningsCard = ({ stats }) => {
  // Calculate earnings from stats (will be replaced with real earnings API)
  const earnings = {
    monthly: stats?.sessionsToday ? stats.sessionsToday * 300 * 30 : 0, // Estimate
    currency: 'ج.م',
    growth: 12,
    sessions: stats?.sessionsToday || 0,
    pending: stats?.pendingRequests ? stats.pendingRequests * 300 : 0,
  };

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 h-full">
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الملخص المالي</h2>

      {/* Monthly Earnings */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[var(--text-secondary)] text-sm">دخل هذا الشهر (تقديري)</span>
          <span className="text-green-500 text-sm font-medium">
            <i className="fas fa-arrow-up ml-1"></i>
            {earnings.growth}%
          </span>
        </div>
        <div className="text-3xl font-bold text-[var(--text-primary)]">
          {earnings.monthly.toLocaleString()} {earnings.currency}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <div className="text-sm text-[var(--text-secondary)] mb-1">الجلسات اليوم</div>
          <div className="text-xl font-bold text-[var(--text-primary)]">{earnings.sessions}</div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
          <div className="text-sm text-[var(--text-secondary)] mb-1">مدفوعات معلقة</div>
          <div className="text-xl font-bold text-amber-500">{earnings.pending.toLocaleString()}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          to="/therapist/earnings"
          className="block w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium text-center hover:bg-[var(--primary-hover)] transition-colors"
        >
          <i className="fas fa-file-invoice-dollar ml-2"></i>
          التقرير المالي
        </Link>
        <Link
          to="/therapist/analytics"
          className="block w-full py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium text-center hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <i className="fas fa-chart-bar ml-2"></i>
          التحليلات الشاملة
        </Link>
      </div>
    </div>
  );
};

export default EarningsCard;
