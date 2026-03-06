import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import { apiRequest } from '../../api.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    articles: 0,
    videos: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel with proper error handling
      const promises = [
        apiRequest('/users', { method: 'GET' }).catch(() => ({ users: [], total: 0 })),
        apiRequest('/articles?limit=1', { method: 'GET' }).catch(() => ({ articles: [], total: 0 })),
        apiRequest('/videos?limit=1', { method: 'GET' }).catch(() => ({ videos: [], total: 0 })),
        apiRequest('/comments', { method: 'GET' }).catch(() => ({ comments: [], total: 0 })),
      ];
      
      const [usersData, articlesData, videosData, commentsData] = await Promise.all(promises);
      
      console.log('Dashboard Stats:', {
        users: usersData,
        articles: articlesData,
        videos: videosData,
        comments: commentsData,
      });
      
      // Get counts from API responses
      setStats({
        users: usersData?.total || usersData?.users?.length || 0,
        articles: articlesData?.total || articlesData?.articles?.length || 0,
        videos: videosData?.total || videosData?.videos?.length || 0,
        comments: commentsData?.total || commentsData?.comments?.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'المستخدمين',
      value: stats.users,
      icon: 'fa-users',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/users',
    },
    {
      title: 'المقالات',
      value: stats.articles,
      icon: 'fa-newspaper',
      color: 'from-green-500 to-green-600',
      link: '/admin/articles',
    },
    {
      title: 'الفيديوهات',
      value: stats.videos,
      icon: 'fa-video',
      color: 'from-purple-500 to-purple-600',
      link: '/videos/manage',
    },
    {
      title: 'التعليقات',
      value: stats.comments,
      icon: 'fa-comments',
      color: 'from-orange-500 to-orange-600',
      link: '/admin/comments',
    },
  ];

  const quickActions = [
    {
      title: 'إضافة فيديو',
      icon: 'fa-plus-circle',
      link: '/videos/manage',
      description: 'إضافة فيديو جديد للمكتبة',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'مراجعة المقالات',
      icon: 'fa-clipboard-check',
      link: '/admin/articles?status=pending',
      description: 'مراجعة المقالات المعلقة',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'التعليقات المبلغ عنها',
      icon: 'fa-flag',
      link: '/admin/comments?filter=reported',
      description: 'مراجعة التعليقات المبلغ عنها',
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'إعدادات المنصة',
      icon: 'fa-cog',
      link: '/admin/settings',
      description: 'إعدادات النظام العامة',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <AnimatedItem key={stat.title} type="slideUp" delay={index * 0.05}>
            <div
              onClick={() => navigate(stat.link)}
              className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all cursor-pointer hover:shadow-xl hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <i className={`fas ${stat.icon} text-2xl text-white`}></i>
                </div>
                {loading ? (
                  <div className="animate-pulse h-8 w-16 bg-[var(--bg-secondary)] rounded"></div>
                ) : (
                  <div className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</div>
                )}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{stat.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">اضغط للتفاصيل</p>
            </div>
          </AnimatedItem>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-right">
          <i className="fas fa-bolt text-[var(--primary-color)] ml-2"></i>
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <AnimatedItem key={action.title} type="slideUp" delay={index * 0.05 + 0.2}>
              <div
                onClick={() => navigate(action.link)}
                className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all cursor-pointer hover:shadow-lg"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                  <i className={`fas ${action.icon} text-xl text-white`}></i>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{action.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{action.description}</p>
              </div>
            </AnimatedItem>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-right">
          <i className="fas fa-clock text-[var(--primary-color)] ml-2"></i>
          نشاط حديث
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-user text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-[var(--text-primary)] font-medium">مستخدم جديد انضم للمنصة</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">منذ {index + 1} ساعة</p>
              </div>
              <button className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                عرض
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
