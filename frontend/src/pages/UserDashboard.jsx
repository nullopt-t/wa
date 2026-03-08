import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { apiRequest } from '../api.js';

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [dailyMood, setDailyMood] = useState(null);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  // Load real data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user's preferences and history from localStorage
      const userHistory = JSON.parse(localStorage.getItem('userReadingHistory') || '[]');
      const userLikes = JSON.parse(localStorage.getItem('userLikes') || '[]');
      const userSaves = JSON.parse(localStorage.getItem('userSaves') || '[]');
      const todayMood = localStorage.getItem(`mood-${new Date().toDateString()}`);
      
      // Determine user interests based on their activity
      const interests = [];
      
      // Get tags from history and likes
      userHistory.forEach(item => {
        if (item.tags) interests.push(...item.tags);
      });
      userLikes.forEach(item => {
        if (item.tags) interests.push(...item.tags);
      });
      
      // Count tag frequency
      const tagCounts = {};
      interests.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      // Get top 3 interests
      const topInterests = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);
      
      // Load articles and videos
      const articlesData = await apiRequest('/articles?limit=20&status=published', { method: 'GET' }).catch(() => ({ articles: [] }));
      const videosData = await apiRequest('/videos?limit=20', { method: 'GET' }).catch(() => ({ videos: [] }));
      
      const articles = articlesData.articles || [];
      const videos = videosData.videos || [];
      
      // Score content based on user preferences
      const scoreContent = (item) => {
        let score = 0;
        
        // Boost if user liked/saved similar content
        if (userLikes.some(liked => liked._id === item._id)) score += 10;
        if (userSaves.some(saved => saved._id === item._id)) score += 10;
        
        // Boost if matches user's top interests
        if (item.tags) {
          item.tags.forEach(tag => {
            if (topInterests.includes(tag)) score += 5;
          });
        }
        
        // Boost if featured
        if (item.isFeatured) score += 3;
        
        // Boost recent content
        const daysSinceCreated = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 7) score += 2;
        
        // Mood-based recommendations
        if (todayMood !== null) {
          const mood = parseInt(todayMood);
          // If feeling down (0-1), recommend uplifting content
          if (mood <= 1 && item.tags?.some(t => ['سعادة', 'تحفيز', 'إيجابية'].includes(t))) {
            score += 8;
          }
          // If feeling good (3-4), recommend educational content
          if (mood >= 3 && item.tags?.some(t => ['تعليم', 'تطوير', 'نصائح'].includes(t))) {
            score += 5;
          }
        }
        
        return score;
      };
      
      // Combine and score all content
      const allContent = [
        ...articles.map(a => ({ 
          id: a._id, 
          title: a.title, 
          category: 'مقالات',
          type: 'article',
          slug: a.slug || a._id,
          tags: a.tags || [],
          isFeatured: a.isFeatured,
          createdAt: a.createdAt,
          score: scoreContent(a)
        })),
        ...videos.map(v => ({ 
          id: v._id, 
          title: v.title, 
          category: 'فيديوهات',
          type: 'video',
          url: v.videoUrl,
          tags: v.tags || [],
          isFeatured: v.isFeatured,
          createdAt: v.createdAt,
          score: scoreContent(v)
        }))
      ];
      
      // Sort by score (highest first) and pick top 5
      const sorted = allContent.sort((a, b) => b.score - a.score);
      setRecommendedContent(sorted.slice(0, 5));
      
      // Load today's mood if exists
      if (todayMood) {
        setDailyMood(parseInt(todayMood));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = async (moodIndex) => {
    const moods = ['حزين', 'سيء', 'عادي', 'جيد', 'سعيد'];
    const moodText = moods[moodIndex] || 'جيد';
    
    setDailyMood(moodIndex);
    
    // Save to localStorage
    const today = new Date().toDateString();
    localStorage.setItem(`mood-${today}`, moodIndex.toString());
    
    // TODO: Send to backend when mood tracking API is available
    console.log(`Mood saved: ${moodText} (${moodIndex})`);
  };

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
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">الوصول السريع</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Link to="/categories" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-compass text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">التصنيفات</span>
                  </Link>
                  <Link to="/community" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-users text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">المجتمع</span>
                  </Link>
                  <Link to="/articles" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-newspaper text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">المقالات</span>
                  </Link>
                  <Link to="/videos" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-video text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">الفيديوهات</span>
                  </Link>
                  <Link to="/chatbot" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-robot text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">المساعد</span>
                  </Link>
                  <Link to="/profile-settings" className="p-4 bg-[var(--bg-secondary)] rounded-xl text-center hover:bg-[var(--bg-primary)] transition-colors">
                    <i className="fas fa-user text-[var(--primary-color)] text-2xl block mb-2"></i>
                    <span className="text-[var(--text-primary)]">الملف الشخصي</span>
                  </Link>
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
                {dailyMood !== null ? (
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">
                      {['😢', '😞', '😐', '🙂', '😄'][dailyMood] || '😊'}
                    </div>
                    <p className="text-[var(--text-primary)]">
                      {['حزين', 'سيء', 'عادي', 'جيد', 'سعيد'][dailyMood] || 'بخير'}
                    </p>
                    <button
                      onClick={() => setDailyMood(null)}
                      className="mt-4 text-sm text-[var(--primary-color)] hover:underline"
                    >
                      تغيير المزاج
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[var(--text-secondary)] text-center mb-4">كيف تشعر اليوم؟</p>
                    <div className="grid grid-cols-5 gap-2">
                      {['😢', '😞', '😐', '🙂', '😄'].map((emoji, index) => (
                        <button
                          key={index}
                          className="py-3 rounded-xl text-2xl bg-[var(--bg-secondary)] hover:bg-[var(--primary-color)] hover:scale-110 transition-all"
                          onClick={() => handleMoodSelect(index)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </AnimatedItem>

            {/* Recommended Content */}
            <AnimatedItem type="slideRight" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">مقترحات لك</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
                  </div>
                ) : recommendedContent.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedContent.map((item) => (
                      <Link
                        key={item.id}
                        to={item.type === 'article' ? `/articles/${item.slug || item.id}` : '/videos'}
                        className="block p-4 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--bg-primary)] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-[var(--text-primary)] font-medium">{item.title}</div>
                            <div className="text-[var(--text-secondary)] text-sm">{item.category}</div>
                          </div>
                          <i className={`fas ${item.type === 'article' ? 'fa-newspaper' : 'fa-video'} text-[var(--primary-color)]`}></i>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--text-secondary)]">
                    <i className="fas fa-inbox text-4xl mb-2"></i>
                    <p>لا توجد توصيات حالياً</p>
                  </div>
                )}
              </div>
            </AnimatedItem>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;