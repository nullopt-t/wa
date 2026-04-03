import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { notificationAPI } from '../services/notificationApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(1, 50, filter === 'unread');
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      
      ;
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      ;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      ;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      feedback_response: { icon: 'fa-comments', color: 'text-purple-500', bg: 'bg-purple-500/20' },
      comment_reply: { icon: 'fa-reply', color: 'text-blue-500', bg: 'bg-blue-500/20' },
      post_approved: { icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-500/20' },
      story_approved: { icon: 'fa-book-open', color: 'text-amber-500', bg: 'bg-amber-500/20' },
      account_activated: { icon: 'fa-user-check', color: 'text-green-500', bg: 'bg-green-500/20' },
      new_comment: { icon: 'fa-comment', color: 'text-blue-500', bg: 'bg-blue-500/20' },
      system: { icon: 'fa-bell', color: 'text-gray-500', bg: 'bg-gray-500/20' },
    };
    return icons[type] || icons.system;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now - past) / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    return past.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-bell text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">يجب تسجيل الدخول</h2>
          <Link to="/login" className="text-[var(--primary-color)] hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">الإشعارات</h1>
          <p className="text-[var(--text-secondary)]">تابع آخر التحديثات والردود</p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border-color)] mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
                }`}
              >
                غير المقروءة
              </button>
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-bell text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <p className="text-[var(--text-secondary)]">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {notifications.map((notification, index) => {
                const iconData = getNotificationIcon(notification.type);
                return (
                  <AnimatedItem key={notification._id} type="slideUp" delay={index * 0.05}>
                    <div
                      onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                      className={`p-6 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-[var(--primary-color)]/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconData.bg}`}>
                          <i className={`fas ${iconData.icon} ${iconData.color} text-xl`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className={`font-bold text-lg mb-1 ${
                                !notification.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                              }`}>
                                {notification.title}
                              </h3>
                              <p className="text-[var(--text-secondary)]">{notification.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>
                            )}
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                عرض →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
