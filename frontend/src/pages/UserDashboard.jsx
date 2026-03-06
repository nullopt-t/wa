import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [dailyMood, setDailyMood] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  // Load user data from AuthContext
  useEffect(() => {
    // Mock recent activity (replace with real API call)
    setRecentActivity([
      { id: 1, type: 'article', title: 'كيفية التعامل مع التوتر', date: '2024-01-20' },
      { id: 2, type: 'habit', title: 'تم تسجيل عادة جديدة', date: '2024-01-19' },
      { id: 3, type: 'community', title: 'تم نشر منشور في المجتمع', date: '2024-01-18' }
    ]);

    // Mock recommended content (replace with real API call)
    setRecommendedContent([
      { id: 1, title: 'مقالات عن إدارة التوتر', category: 'مقالات' },
      { id: 2, title: 'تمارين اليقظة الذهنية', category: 'تمارين' },
      { id: 3, title: 'بناء علاقات صحية', category: 'أدلة' }
    ]);
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Welcome Banner */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <section className="py-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً، {user?.firstName} {user?.lastName}</h1>
                <p className="text-xl opacity-90">نأمل أن تكون في يوم جميل ونفسي مريح</p>
              </div>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-shield-alt"></i>
                  <span className="hidden md:inline">لوحة الإدارة</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      </AnimatedItem>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Stats and Goals */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">إحصائيات سريعة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">12</div>
                    <div className="text-[var(--text-secondary)]">أيام متصلة</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">24</div>
                    <div className="text-[var(--text-secondary)]">تمارين أداءت</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">8</div>
                    <div className="text-[var(--text-secondary)]">مقالات قرأت</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-[var(--primary-color)]">5</div>
                    <div className="text-[var(--text-secondary)]">مشاركات</div>
                  </div>
                </div>
              </div>
            </AnimatedItem>

            {/* Therapy Goals */}
            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">أهداف العلاج</h2>
                <div className="space-y-4">
                  {user?.therapyGoals?.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <span className="text-[var(--text-primary)]">{goal}</span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-[var(--primary-color)] text-white rounded-lg text-sm">تحديث</button>
                        <button className="px-3 py-1 bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-lg text-sm border border-[var(--border-color)]">حذف</button>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 border-2 border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <i className="fas fa-plus ml-2"></i> إضافة هدف جديد
                  </button>
                </div>
              </div>
            </AnimatedItem>

            {/* Recent Activity */}
            <AnimatedItem type="slideUp" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">النشاط الأخير</h2>
                <div className="space-y-4">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                      <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white mr-4">
                        {activity.type === 'article' && <i className="fas fa-book"></i>}
                        {activity.type === 'habit' && <i className="fas fa-check-circle"></i>}
                        {activity.type === 'community' && <i className="fas fa-comments"></i>}
                      </div>
                      <div className="flex-1">
                        <div className="text-[var(--text-primary)] font-medium">{activity.title}</div>
                        <div className="text-[var(--text-secondary)] text-sm">{activity.date}</div>
                      </div>
                      <button className="text-[var(--primary-color)] hover:text-[var(--primary-hover)]">
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          </div>

          {/* Right Column - Mood Tracker and Recommendations */}
          <div className="space-y-8">
            {/* Daily Mood Tracker */}
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">مood اليوم</h2>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">😊</div>
                  <p className="text-[var(--text-primary)]">أنا بخير اليوم</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['😢', '😞', '😐', '🙂', '😄'].map((emoji, index) => (
                    <button
                      key={index}
                      className={`py-3 rounded-xl text-2xl ${index === 3 ? 'bg-[var(--primary-color)]' : 'bg-[var(--bg-secondary)]'}`}
                      onClick={() => setDailyMood(index)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Recommended Content */}
            <AnimatedItem type="slideRight" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">مقترحات لك</h2>
                <div className="space-y-4">
                  {recommendedContent.map(item => (
                    <Link 
                      key={item.id} 
                      to="#" 
                      className="block p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors"
                    >
                      <div className="text-[var(--text-primary)] font-medium">{item.title}</div>
                      <div className="text-[var(--text-secondary)] text-sm">{item.category}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem type="slideRight" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الوصول السريع</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/categories" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-compass text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">التصنيفات</span>
                  </Link>
                  <Link to="/community" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-users text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">المجتمع</span>
                  </Link>
                  <Link to="/habits" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-check-circle text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">العادات</span>
                  </Link>
                  <Link to="/chatbot" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-robot text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">المساعد</span>
                  </Link>
                  <Link to="/profile-settings" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-user text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">الملف الشخصي</span>
                  </Link>
                  <Link to="/account-settings" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-cog text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">إعدادات الحساب</span>
                  </Link>
                </div>
              </div>
            </AnimatedItem>

            {/* Support Resources */}
            <AnimatedItem type="slideRight" delay={0.5}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الدعم الطارئ</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <div className="text-[var(--text-primary)] font-medium">الخط الساخن لل emergenies</div>
                    <div className="text-red-500 font-bold text-lg">1234</div>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="text-[var(--text-primary)] font-medium">الدعم النفسي</div>
                    <div className="text-yellow-500 font-bold text-lg">5678</div>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;