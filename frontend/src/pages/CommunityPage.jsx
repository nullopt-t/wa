import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [user] = useState({ name: 'أحمد محمد', avatar: 'AM' }); // Mock user data

  // Mock data for posts
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        author: { name: 'نور إبراهيم', avatar: 'NI', role: 'user' },
        content: 'مرحباً بالجميع، أشعر اليوم بتحسن كبير بعد ممارسة تقنيات التنفس التي تعلمتها في منصة وعي. شكرًا لكم على هذا الدعم الرائع!',
        timestamp: '20 دقيقة مضت',
        likes: 12,
        comments: 5,
        category: 'قصص نجاح'
      },
      {
        id: 2,
        author: { name: 'د. سارة أحمد', avatar: 'SA', role: 'therapist' },
        content: 'نصيحة اليوم: لا تتردد في طلب المساعدة عند الحاجة. الصحة النفسية مهمة مثل الصحة الجسدية.',
        timestamp: 'ساعة مضت',
        likes: 24,
        comments: 8,
        category: 'نصائح'
      },
      {
        id: 3,
        author: { name: 'محمد علي', avatar: 'MA', role: 'user' },
        content: 'هل هناك من يمر بتجارب مشابهة للتوتر قبل الأزمات؟ أود مشاركة تجاربي والتحدث عن كيفية التغلب عليها.',
        timestamp: '3 ساعات مضت',
        likes: 8,
        comments: 12,
        category: 'دعم متبادل'
      },
      {
        id: 4,
        author: { name: 'ليلى عمر', avatar: 'LO', role: 'user' },
        content: 'أحببت هذه المقالة عن تقنيات إدارة التوتر. هل يمكن لأحد أن يشاركني تجاربه مع هذه التقنية؟',
        timestamp: '5 ساعات مضت',
        likes: 15,
        comments: 7,
        category: 'أسئلة واستفسارات'
      }
    ];
    
    setPosts(mockPosts);
  }, []);

  const categories = [
    { id: 'all', name: 'الكل', count: 24 },
    { id: 'success', name: 'قصص نجاح', count: 8 },
    { id: 'support', name: 'دعم متبادل', count: 12 },
    { id: 'advice', name: 'نصائح', count: 18 },
    { id: 'questions', name: 'أسئلة', count: 15 },
    { id: 'resources', name: 'موارد', count: 9 }
  ];

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: user,
        content: newPost,
        timestamp: 'الآن',
        likes: 0,
        comments: 0,
        category: 'عام'
      };
      
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => 
        activeTab === 'success' && post.category.includes('قصص') ||
        activeTab === 'support' && post.category.includes('دعم') ||
        activeTab === 'advice' && post.category.includes('نصائح') ||
        activeTab === 'questions' && post.category.includes('أسئلة') ||
        activeTab === 'resources' && post.category.includes('موارد')
      );

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Community Header */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <section className="py-12 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">مجتمع وعي</h1>
            <p className="text-xl opacity-90 max-w-3xl">انضم إلى مجتمع من الأفراد الذين يمرون بتجارب مشابهة ويسعون لتحسين صحتهم النفسية</p>
          </div>
        </section>
      </AnimatedItem>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories and Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Guidelines */}
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">إرشادات المجتمع</h3>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                    <span>كن محترمًا مع الآخرين</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                    <span>شارك تجاربك الشخصية فقط</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                    <span>لا تقدم تشخيصات طبية</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mt-1 ml-2"></i>
                    <span>احترم الخصوصية</span>
                  </li>
                </ul>
              </div>
            </AnimatedItem>

            {/* Discussion Categories */}
            <AnimatedItem type="slideRight" delay={0.3}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">التصنيفات</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`w-full text-right p-3 rounded-xl flex justify-between items-center ${
                        activeTab === category.id
                          ? 'bg-[var(--primary-color)] text-white'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </AnimatedItem>

            {/* Active Members */}
            <AnimatedItem type="slideRight" delay={0.4}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">الأعضاء النشطون</h3>
                <div className="space-y-3">
                  {[
                    { name: 'نور إبراهيم', posts: 24 },
                    { name: 'محمد علي', posts: 18 },
                    { name: 'ليلى عمر', posts: 15 },
                    { name: 'د. سارة أحمد', posts: 32 }
                  ].map((member, index) => (
                    <div key={index} className="flex items-center p-2 hover:bg-[var(--bg-secondary)] rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-sm mr-3">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="text-[var(--text-primary)] text-sm">{member.name}</div>
                        <div className="text-[var(--text-secondary)] text-xs">{member.posts} مشاركات</div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedItem>
          </div>

          {/* Main Content - Posts Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Card */}
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                    {user.avatar}
                  </div>
                  <form onSubmit={handlePostSubmit} className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="شارك شيئاً مع المجتمع..."
                      className="w-full p-4 bg-[var(--bg-secondary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                      rows="3"
                    ></textarea>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-4 text-[var(--text-secondary)]">
                        <button type="button" className="hover:text-[var(--primary-color)]">
                          <i className="fas fa-image"></i>
                        </button>
                        <button type="button" className="hover:text-[var(--primary-color)]">
                          <i className="fas fa-smile"></i>
                        </button>
                        <button type="button" className="hover:text-[var(--primary-color)]">
                          <i className="fas fa-paperclip"></i>
                        </button>
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                      >
                        مشاركة
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </AnimatedItem>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <AnimatedItem key={post.id} type="slideUp" delay={0.1 * index}>
                  <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[var(--text-primary)]">{post.author.name}</h4>
                            <span className="text-[var(--text-secondary)] text-sm">{post.timestamp}</span>
                          </div>
                          <span className="px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
                            {post.category}
                          </span>
                        </div>
                        
                        <p className="mt-3 text-[var(--text-primary)] leading-relaxed">{post.content}</p>
                        
                        <div className="flex space-x-6 mt-4 pt-4 border-t border-[var(--border-color)]/30">
                          <button className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)]">
                            <i className="far fa-heart"></i>
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)]">
                            <i className="far fa-comment"></i>
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)]">
                            <i className="fas fa-share"></i>
                            <span>مشاركة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Comments Section (simplified) */}
                    <div className="mt-6 pl-16 space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xs">
                          SA
                        </div>
                        <div className="bg-[var(--bg-secondary)] p-3 rounded-xl flex-1">
                          <div className="font-medium text-[var(--text-primary)] text-sm">د. سارة أحمد</div>
                          <p className="text-[var(--text-secondary)] text-sm mt-1">هذا رائع! مشاركة رائعة ومفيدة للجميع.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                          MA
                        </div>
                        <div className="bg-[var(--bg-secondary)] p-3 rounded-xl flex-1">
                          <div className="font-medium text-[var(--text-primary)] text-sm">محمد علي</div>
                          <p className="text-[var(--text-secondary)] text-sm mt-1">أنا أيضاً أشعر بنفس الشيء، شكرًا لمشاركتك.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xs">
                          {user.avatar}
                        </div>
                        <input
                          type="text"
                          placeholder="أضف تعليقك..."
                          className="flex-1 p-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;