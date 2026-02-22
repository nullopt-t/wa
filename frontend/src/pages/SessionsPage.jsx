import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { sessionsAPI } from '../services/sessionsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const SessionsPage = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  // Load sessions
  useEffect(() => {
    loadSessions();
  }, [filters.status, pagination.currentPage]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        page: pagination.currentPage,
        limit: 20,
      };

      const data = await sessionsAPI.getAll(params);
      setSessions(data.sessions);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      showError(error.message || 'فشل تحميل الجلسات');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const handleCancelSession = async (id) => {
    if (!confirm('هل أنت متأكد من إلغاء هذه الجلسة؟')) return;

    const reason = prompt('سبب الإلغاء (اختياري):');
    
    try {
      await sessionsAPI.cancel(id, reason || '');
      success('تم إلغاء الجلسة بنجاح');
      loadSessions();
    } catch (error) {
      showError(error.message || 'فشل إلغاء الجلسة');
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">إدارة الجلسات</h1>
              <p className="text-[var(--text-secondary)]">عرض وإدارة جميع الجلسات</p>
            </div>
            <Link
              to="/sessions/new"
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              جلسة جديدة
            </Link>
          </div>
        </AnimatedItem>

        {/* Filters */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">الحالة</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
                >
                  <option value="all">الكل</option>
                  <option value="pending">معلقة</option>
                  <option value="confirmed">مؤكدة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">النوع</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
                >
                  <option value="all">الكل</option>
                  <option value="individual">فردية</option>
                  <option value="couple">زوجية</option>
                  <option value="family">عائلية</option>
                  <option value="group">جماعية</option>
                  <option value="follow-up">متابعة</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">بحث</label>
                <input
                  type="text"
                  placeholder="اسم العميل..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
                />
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Sessions List */}
        <AnimatedItem type="slideUp" delay={0.3}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-12 text-center">
                <i className="fas fa-calendar-times text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <p className="text-[var(--text-secondary)]">لا توجد جلسات</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]/30">
                {sessions.map((session) => {
                  const { date, time } = formatDateTime(session.dateTime);
                  const statusBadge = getStatusBadge(session.status);

                  return (
                    <div
                      key={session.id}
                      className="p-6 hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Client Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold">
                            {session.clientId?.avatar ? (
                              <img src={session.clientId.avatar} alt={session.clientId.firstName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              session.clientId?.firstName?.charAt(0) || 'ع'
                            )}
                          </div>

                          {/* Session Info */}
                          <div>
                            <h3 className="font-bold text-[var(--text-primary)]">
                              {session.clientId?.firstName} {session.clientId?.lastName}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-1">
                              <span>
                                <i className="fas fa-calendar ml-1"></i>
                                {date}
                              </span>
                              <span>
                                <i className="fas fa-clock ml-1"></i>
                                {time}
                              </span>
                              <span>
                                <i className="fas fa-clock ml-1"></i>
                                {session.duration} دقيقة
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/sessions/${session.id}`}
                              className="px-4 py-2 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg text-sm hover:bg-[var(--primary-color)]/20 transition-colors"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>

                            {session.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancelSession(session.id)}
                                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <AnimatedItem type="slideUp" delay={0.4}>
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPagination({ ...pagination, currentPage: i + 1 })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pagination.currentPage === i + 1
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          </AnimatedItem>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
