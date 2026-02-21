import React from 'react';
import { Link } from 'react-router-dom';

const RecentClients = ({ clients }) => {
  const getProgressBadge = (progress) => {
    const badges = {
      excellent: { color: 'bg-green-500/20 text-green-500', label: 'ممتاز' },
      good: { color: 'bg-blue-500/20 text-blue-500', label: 'جيد' },
      fair: { color: 'bg-yellow-500/20 text-yellow-500', label: 'متوسط' },
      'needs-attention': { color: 'bg-red-500/20 text-red-500', label: 'بحاجة لمتابعة' },
    };
    return badges[progress] || badges.good;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">العملاء الحاليين</h2>
          <Link
            to="/therapist/clients"
            className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium"
          >
            عرض الكل <i className="fas fa-arrow-left mr-1"></i>
          </Link>
        </div>
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <p className="text-[var(--text-secondary)]">لا يوجد عملاء حاليين</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">العملاء الحاليين</h2>
        <Link
          to="/therapist/clients"
          className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium"
        >
          عرض الكل <i className="fas fa-arrow-left mr-1"></i>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-color)]">
              <th className="text-right py-3 text-[var(--text-secondary)] font-medium">العميل</th>
              <th className="text-right py-3 text-[var(--text-secondary)] font-medium">آخر جلسة</th>
              <th className="text-right py-3 text-[var(--text-secondary)] font-medium">التحسن</th>
              <th className="text-right py-3 text-[var(--text-secondary)] font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const progressBadge = getProgressBadge(client.progress);
              return (
                <tr key={client.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {client.avatar ? (
                        <img 
                          src={client.avatar.startsWith('/') ? `http://localhost:4000${client.avatar}` : client.avatar} 
                          alt={client.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                          {client.firstName?.charAt(0) || 'ع'}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {client.firstName} {client.lastName}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-[var(--text-secondary)]">
                    {client.lastSessionDate ? formatDate(client.lastSessionDate) : '—'}
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${progressBadge.color}`}>
                      {progressBadge.label}
                    </span>
                  </td>
                  <td className="py-4">
                    <Link
                      to={`/therapist/clients/${client.id}`}
                      className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm hover:bg-[var(--primary-hover)] transition-colors"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentClients;
