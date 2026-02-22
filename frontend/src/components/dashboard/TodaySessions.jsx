import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TodaySessions = ({ sessions }) => {
  const [filter, setFilter] = useState('all');

  const filteredSessions = sessions?.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  }) || [];

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-500', label: 'معلقة' },
      confirmed: { color: 'bg-green-500/20 text-green-500', label: 'مؤكدة' },
      completed: { color: 'bg-blue-500/20 text-blue-500', label: 'مكتملة' },
      cancelled: { color: 'bg-red-500/20 text-red-500', label: 'ملغاة' },
      'no-show': { color: 'bg-gray-500/20 text-gray-500', label: 'لم يحضر' },
    };
    return badges[status] || badges.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      individual: 'fa-user',
      couple: 'fa-user-friends',
      family: 'fa-users',
      group: 'fa-users',
      'follow-up': 'fa-redo',
    };
    return icons[type] || icons.individual;
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">جلسات اليوم</h2>
          <Link
            to="#"
            className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium"
          >
            عرض الكل <i className="fas fa-arrow-left mr-1"></i>
          </Link>
        </div>
        <div className="text-center py-12">
          <i className="fas fa-calendar-check text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <p className="text-[var(--text-secondary)]">لا توجد جلسات اليوم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">جلسات اليوم</h2>
        <Link
          to="#"
          className="text-[var(--primary-color)] hover:text-[var(--primary-hover)] text-sm font-medium"
        >
          عرض الكل <i className="fas fa-arrow-left mr-1"></i>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: 'الكل' },
          { value: 'pending', label: 'معلقة' },
          { value: 'confirmed', label: 'مؤكدة' },
          { value: 'completed', label: 'مكتملة' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-[var(--primary-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const statusBadge = getStatusBadge(session.status);
          return (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors"
            >
              <div className="flex items-center gap-4">
                {session.client?.avatar ? (
                  <img 
                    src={session.client.avatar.startsWith('/') ? `http://localhost:4000${session.client.avatar}` : session.client.avatar} 
                    alt={session.client.firstName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white">
                    <i className={`fas ${getTypeIcon(session.type)}`}></i>
                  </div>
                )}
                <div>
                  <div className="font-medium text-[var(--text-primary)]">
                    {session.client?.firstName} {session.client?.lastName}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    <i className="fas fa-clock ml-1"></i>
                    {formatTime(session.dateTime)}
                    <span className="mx-2">•</span>
                    <span className="capitalize">{session.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
                {session.status === 'confirmed' && (
                  <button className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm hover:bg-[var(--primary-hover)] transition-colors">
                    بدء الجلسة
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaySessions;
