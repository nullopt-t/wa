import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotificationsBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - will be replaced with real Socket.IO data
  useEffect(() => {
    // TODO: Implement Socket.IO connection for real-time notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'booking',
        title: 'طلب جلسة جديد',
        message: 'أحمد محمد طلب جلسة جديدة',
        time: 'منذ 5 دقائق',
        isRead: false,
        icon: 'fa-calendar-plus',
        color: 'text-blue-500',
      },
      {
        id: 2,
        type: 'reschedule',
        title: 'طلب إعادة جدولة',
        message: 'نور إبراهيم يريد إعادة جدولة الجلسة',
        time: 'منذ 15 دقيقة',
        isRead: false,
        icon: 'fa-clock',
        color: 'text-amber-500',
      },
      {
        id: 3,
        type: 'message',
        title: 'رسالة جديدة',
        message: 'محمد علي أرسل رسالة',
        time: 'منذ ساعة',
        isRead: true,
        icon: 'fa-comment',
        color: 'text-green-500',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
      >
        <i className="fas fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 z-50 max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-4 border-b border-[var(--border-color)]/30">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--text-primary)]">
                  الإشعارات
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)]"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-[var(--border-color)]/30">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <i className="fas fa-bell-slash text-4xl text-[var(--text-secondary)]/30 mb-3"></i>
                  <p className="text-[var(--text-secondary)]">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-[var(--bg-primary)]/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center ${notification.color}`}>
                        <i className={`fas ${notification.icon} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium text-sm ${
                            !notification.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-[var(--text-secondary)]/70 mt-1 block">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-color)]/30 text-center">
              <Link
                to="/therapist/notifications"
                className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium"
              >
                عرض جميع الإشعارات <i className="fas fa-arrow-left mr-1"></i>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsBell;
