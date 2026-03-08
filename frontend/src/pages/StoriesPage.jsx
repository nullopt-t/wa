import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { storiesAPI } from '../services/communityApi.js';

const StoriesPage = () => {
  const { success, error: showError } = useToast();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Load stories
  useEffect(() => {
    loadStories();
  }, [activeFilter]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (activeFilter && activeFilter !== 'all') {
        params.category = activeFilter;
      }
      
      params.sort = 'newest';
      params.page = 1;
      params.limit = 12;
      
      const data = await storiesAPI.getAll(params);
      setStories(data.stories || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error('Failed to load stories:', error);
      showError('فشل تحميل القصص');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'قصة مشتركة', value: stories.length, icon: 'fa-book-open', color: 'from-amber-500 to-orange-500' },
    { label: 'قارئ', value: stories.reduce((acc, s) => acc + (s.views || 0), 0), icon: 'fa-eye', color: 'from-blue-500 to-cyan-500' },
    { label: 'تفاعل', value: stories.reduce((acc, s) => acc + (s.likes?.length || 0), 0), icon: 'fa-heart', color: 'from-pink-500 to-rose-500' },
  ];

  const filters = [
    { id: 'all', label: 'الكل', icon: 'fa-layer-group', color: 'from-blue-500 to-cyan-500' },
    { id: 'recovery', label: 'التعافي', icon: 'fa-heart', color: 'from-green-500 to-emerald-500' },
    { id: 'relationships', label: 'العلاقات', icon: 'fa-users', color: 'from-purple-500 to-pink-500' },
    { id: 'depression', label: 'الاكتئاب', icon: 'fa-cloud-rain', color: 'from-blue-600 to-indigo-600' },
    { id: 'anxiety', label: 'القلق', icon: 'fa-wind', color: 'from-yellow-500 to-orange-500' },
    { id: 'addiction', label: 'الإدمان', icon: 'fa-chain-broken', color: 'from-red-500 to-rose-500' },
  ];

  const filteredStories = activeFilter === 'all'
    ? stories
    : stories.filter(s => s.category === activeFilter);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <section className="relative py-20 bg-gradient-to-br from-amber-500/10 via-[var(--bg-primary)] to-purple-500/10">
          <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
              <i className="fas fa-book-open text-white text-4xl"></i>
            </div>
            
            <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-6">
              قصص وتجارب
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              مساحة آمنة لمشاركة رحلتك الشخصية. كل قصة لها قيمة، وقد تكون سببًا في شفاء شخص آخر 💚
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
              {statsCards.map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.color} bg-opacity-10 backdrop-blur-md rounded-2xl p-4 border border-white/10`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <i className={`fas ${stat.icon} text-white`}></i>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedItem>

      {/* Filter Section */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <section className="py-8 sticky top-0 z-20 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border-color)]/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${
                    activeFilter === filter.id
                      ? `bg-gradient-to-r ${filter.color} text-white shadow-lg shadow-${filter.color.split('-')[1]}-500/30 scale-105`
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  <i className={`fas ${filter.icon}`}></i>
                  <span className="hidden sm:inline">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </AnimatedItem>

      {/* Stories Grid */}
      <AnimatedItem type="slideUp" delay={0.3}>
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
                {activeFilter === 'all' ? 'جميع القصص' : filters.find(f => f.id === activeFilter)?.label}
              </h2>
              <p className="text-[var(--text-secondary)]">
                {filteredStories.length} قصة ملهمة
              </p>
            </div>

            {filteredStories.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-inbox text-5xl text-gray-500"></i>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">لا توجد قصص بعد</h3>
                <p className="text-[var(--text-secondary)] mb-6">كن أول من يشارك قصة في هذا التصنيف</p>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-amber-500/30 transition-all hover:scale-105"
                >
                  <i className="fas fa-pen ml-2"></i>
                  اكتب قصتك
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredStories.map((story, index) => (
                  <StoryCard key={story.id || story._id} story={story} delay={index * 0.05} isAuthenticated={isAuthenticated} onLikeSuccess={() => loadStories()} />
                ))}
              </div>
            )}
          </div>
        </section>
      </AnimatedItem>

      {/* Submit Story Section */}
      <AnimatedItem type="slideUp" delay={0.4}>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-purple-500/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-amber-500/20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
                <i className="fas fa-pen-fancy text-white text-3xl"></i>
              </div>
              
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                شارك قصتك
              </h2>
              <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                قصتك قد تكون الأمل الذي يحتاجه شخص آخر. شارك رحلتك وألهم الآخرين للشفاء والتعافي
              </p>

              <button
                onClick={() => setShowSubmitForm(!showSubmitForm)}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/40 transition-all hover:scale-105 inline-flex items-center gap-3"
              >
                <i className="fas fa-plus"></i>
                {showSubmitForm ? 'إغلاق النموذج' : 'ابدأ الكتابة'}
              </button>

              {showSubmitForm && (
                <div className="mt-12 text-right">
                  <StoryForm onClose={() => setShowSubmitForm(false)} onSuccess={() => { setShowSubmitForm(false); loadStories(); }} />
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedItem>
    </div>
  );
};

// Modern Story Card Component
const StoryCard = ({ story, delay, isAuthenticated, onLikeSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(story.isLiked || false);
  const { success, error: showError } = useToast();

  const handleLike = async () => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للإعجاب بالقصة');
      return;
    }

    try {
      const result = await storiesAPI.like(story._id);
      setLiked(result.liked);
      onLikeSuccess?.();
    } catch (error) {
      console.error('Failed to like story:', error);
      showError(error.message || 'فشل الإعجاب بالقصة');
    }
  };

  const categoryColors = {
    recovery: 'from-green-500 to-emerald-500',
    relationships: 'from-purple-500 to-pink-500',
    depression: 'from-blue-600 to-indigo-600',
    anxiety: 'from-yellow-500 to-orange-500',
    addiction: 'from-red-500 to-rose-500',
  };

  const categoryLabels = {
    recovery: 'التعافي',
    relationships: 'العلاقات',
    depression: 'الاكتئاب',
    anxiety: 'القلق',
    addiction: 'الإدمان',
  };

  const categoryIcons = {
    recovery: 'fa-heart',
    relationships: 'fa-users',
    depression: 'fa-cloud-rain',
    anxiety: 'fa-wind',
    addiction: 'fa-chain-broken',
  };

  return (
    <AnimatedItem type="scaleIn" delay={delay}>
      <div className="group relative bg-gradient-to-br from-[var(--card-bg)] to-[var(--bg-secondary)] backdrop-blur-md rounded-3xl border border-[var(--border-color)]/30 overflow-hidden hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-2">
        {/* Top gradient bar */}
        <div className={`h-2 bg-gradient-to-r ${categoryColors[story.category] || 'from-amber-500 to-orange-500'}`}></div>
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/30 flex-shrink-0">
                {story.authorId?.avatar ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${story.authorId.avatar}`} alt={story.authorId?.firstName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  story.authorId?.firstName?.charAt(0) || story.author?.charAt(0) || '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{story.authorId?.firstName || story.author || 'مجهول'}</h3>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <i className="far fa-calendar"></i>
                  <span>{new Date(story.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            {/* Category Badge */}
            <span className={`px-3 py-1.5 bg-gradient-to-r ${categoryColors[story.category] || 'from-amber-500 to-orange-500'} text-white text-xs rounded-full font-medium flex items-center gap-1.5`}>
              <i className={`fas ${categoryIcons[story.category] || 'fa-book'}`}></i>
              <span className="hidden sm:inline">{categoryLabels[story.category] || 'قصة'}</span>
            </span>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className={`text-[var(--text-primary)] leading-relaxed text-sm md:text-base ${isExpanded ? '' : 'line-clamp-3'}`}>
              {story.content}
            </p>
            {story.content.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <i className="fas fa-chevron-up"></i>
                    طي القصة
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down"></i>
                    قراءة المزيد
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]/20">
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <i className="far fa-clock"></i>
                {story.readTime} دقائق
              </span>
              <span className="flex items-center gap-1.5">
                <i className="far fa-eye"></i>
                {story.views}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                  liked 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-red-500'
                }`}
              >
                <i className="fas fa-heart"></i>
                <span>{(story.likes?.length || 0) + (liked ? 1 : 0)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
};

// Story Form Component
const StoryForm = ({ onClose, onSuccess }) => {
  const { success, error: showError } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    isAnonymous: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      showError('يرجى اختيار تصنيف القصة');
      return;
    }

    try {
      setSubmitting(true);
      await storiesAPI.create(formData);
      success('تم إرسال قصتك بنجاح! ستظهر بعد المراجعة');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to submit story:', error);
      showError(error.message || 'فشل إرسال القصة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          عنوان القصة
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="عنوان جذاب لقصة..."
          className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          required
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          محتوى القصة
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="شارك رحلتك بكلماتك..."
          rows="8"
          className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          required
        />
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          {formData.content.length} حرف - شارك تفاصيل كافية لتلهم الآخرين
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          تصنيف القصة
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-5 py-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
          required
        >
          <option value="">اختر التصنيف المناسب</option>
          <option value="recovery">التعافي</option>
          <option value="relationships">العلاقات</option>
          <option value="depression">الاكتئاب</option>
          <option value="anxiety">القلق</option>
          <option value="addiction">الإدمان</option>
          <option value="other">أخرى</option>
        </select>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-2xl">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
          className={`w-12 h-6 rounded-full transition-all ${
            formData.isAnonymous ? 'bg-amber-500' : 'bg-[var(--border-color)]'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
            formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'
          }`}></div>
        </button>
        <span className="text-sm text-[var(--text-primary)]">نشر بشكل مجهول</span>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-amber-500/40 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin ml-2"></i>
              جاري الإرسال...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane ml-2"></i>
              نشر القصة
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-2xl font-medium hover:bg-[var(--bg-secondary)] transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default StoriesPage;
