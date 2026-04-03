import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationAPI } from '../services/notificationApi.js';
import { notificationSocket } from '../services/notificationSocket.js';

const NotificationBell = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Connect to socket
      notificationSocket.connect(user._id);

      // Listen for new notifications
      notificationSocket.onNewNotification((notification) => {
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      });

      // Load initial data
      loadUnreadCount();

      // Poll for unread count every 30 seconds as backup
      const interval = setInterval(loadUnreadCount, 30000);
      return () => {
        clearInterval(interval);
        notificationSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      loadNotifications();
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll(1, 5, false);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      
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
      loadUnreadCount();
    } catch (error) {
      
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      feedback_response: 'fa-comments text-purple-500',
      comment_reply: 'fa-reply text-blue-500',
      post_approved: 'fa-check-circle text-green-500',
      story_approved: 'fa-book-open text-amber-500',
      account_activated: 'fa-user-check text-green-500',
      future_message: 'fa-envelope-open-text text-amber-500',
      new_comment: 'fa-comment text-blue-500',
      system: 'fa-bell text-gray-500',
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
    return past.toLocaleDateString('ar-EG');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 mt-2 w-96 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)]">الإشعارات</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-hover)]"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <i className="fas fa-bell text-3xl mb-2"></i>
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  className={`p-4 border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-[var(--primary-color)]/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.isRead ? 'bg-[var(--primary-color)]/20' : 'bg-[var(--bg-secondary)]'
                    }`}>
                      <i className={`fas ${getNotificationIcon(notification.type)} text-lg`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm mb-1 ${
                        !notification.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-[var(--primary-color)] rounded-full"></span>
                        )}
                      </div>
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium mt-1 inline-block"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                        >
                          عرض →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-color)] text-center">
            <Link
              to="/notifications"
              className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
            >
              عرض جميع الإشعارات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
