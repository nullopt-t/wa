import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import ArticleCard from '../components/articles/ArticleCard.jsx';
import { articlesAPI } from '../services/communityApi.js';

const ArticlesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error: showError, success } = useToast();

  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    tags: [],
    author: 'all',
    status: 'all',
  });
  const [allTags, setAllTags] = useState([]);

  const loadAllTags = useCallback(async () => {
    try {
      const data = await articlesAPI.getAll({ limit: 100, status: 'published' });
      const tagsSet = new Set();
      // Handle both { articles: [...] } and direct array response
      const articlesArray = Array.isArray(data) ? data : (data?.articles || []);
      articlesArray.forEach(article => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet));
    } catch (error) {
      
    }
  }, []);

  const loadFeaturedArticles = useCallback(async () => {
    try {
      const data = await articlesAPI.getAll({ limit: 6, featured: 'true', status: 'published' });
      const articlesArray = Array.isArray(data) ? data : (data?.articles || []);
      setFeaturedArticles(articlesArray);
    } catch (error) {
      
      setFeaturedArticles([]);
    }
  }, []);

  const toggleTag = useCallback((tag) => {
    setFilters(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  }, []);

  const loadArticles = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12, sort: 'publishedAt' };

      if (filters.author === 'mine') {
        params.myArticles = 'true';
        if (filters.status && filters.status !== 'all') {
          params.status = filters.status;
        }
      } else if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.tags && filters.tags.length > 0) {
        params.tag = filters.tags.join(',');
      }

      // Exclude featured articles from main list (they're shown separately)
      params.excludeFeatured = 'true';

      const data = await articlesAPI.getAll(params);
      // Handle both { articles: [...], totalPages, ... } and direct array response
      const articlesArray = Array.isArray(data) ? data : (data?.articles || []);
      setArticles(articlesArray);
      setPagination({
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        total: data?.total || 0,
      });
    } catch (error) {
      
      showError('حدث خطأ أثناء تحميل المقالات');
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  // Load articles whenever filters change
  useEffect(() => {
    setLoading(true);
    loadArticles(1);
  }, [filters, loadArticles]);

  // Load tags once on mount
  useEffect(() => {
    loadAllTags();
    loadFeaturedArticles();
  }, [loadAllTags, loadFeaturedArticles]);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              المقالات
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              مقالات تعليمية ونصائح حول الصحة النفسية والعافية العقلية
            </p>
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => navigate('/articles/manage')}
                className="mt-6 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-pen"></i>
                اكتب مقالاً
              </button>
            )}
          </div>
        </AnimatedItem>

        {/* Featured Articles Section */}
        {featuredArticles.length > 0 && (
          <AnimatedItem type="slideUp" delay={0.15}>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 text-right flex items-center gap-2">
                <i className="fas fa-star text-yellow-500"></i>
                مقالات مميزة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => (
                  <AnimatedItem key={article._id} type="slideUp" delay={index * 0.05}>
                    <ArticleCard article={article} />
                  </AnimatedItem>
                ))}
              </div>
            </div>
          </AnimatedItem>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filter by Author */}
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
                {/* Create Article Button - For admins and therapists only */}
                {isAuthenticated && user && (user.role === 'admin' || user.role === 'therapist') && (
                  <button
                    onClick={() => navigate('/articles/manage')}
                    className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[var(--primary-color)]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    اكتب مقالاً
                  </button>
                )}

                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <i className="fas fa-user text-[var(--primary-color)]"></i>
                  المؤلف
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilters({ tags: [], author: 'all', status: 'all' })}
                    className={`w-full text-right px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.author === 'all'
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]'
                    }`}
                  >
                    جميع المقالات
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => setFilters({ tags: [], author: 'mine', status: 'all' })}
                      className={`w-full text-right px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.author === 'mine'
                          ? 'bg-[var(--primary-color)] text-white'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]'
                      }`}
                    >
                      مقالاتي
                    </button>
                  )}
                </div>
              </div>
            </AnimatedItem>

            {/* Filter by Status */}
            {filters.author === 'mine' && (
              <AnimatedItem type="slideRight" delay={0.3}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <i className="fas fa-file text-[var(--primary-color)]"></i>
                    الحالة
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'الكل' },
                      { value: 'published', label: 'منشور' },
                      { value: 'draft', label: 'مسودة' },
                      { value: 'archived', label: 'مؤرشف' }
                    ].map(item => (
                      <button
                        key={item.value}
                        onClick={() => setFilters(prev => ({ ...prev, status: item.value, tags: [] }))}
                        className={`w-full text-right px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          filters.status === item.value
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedItem>
            )}

            {/* Filter by Tags */}
            {allTags.length > 0 && (
              <AnimatedItem type="slideRight" delay={0.4}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <i className="fas fa-tags text-[var(--primary-color)]"></i>
                    الوسوم
                  </h3>
                  {filters.tags && filters.tags.length > 0 && (
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, tags: [] }))}
                      className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-hover)] flex items-center gap-1 font-medium mb-3"
                    >
                      <i className="fas fa-times-circle"></i>
                      إزالة الكل ({filters.tags.length})
                    </button>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          filters.tags && filters.tags.includes(tag)
                            ? 'bg-[var(--primary-color)] text-white'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)]'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedItem>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* All Articles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {filters.author === 'mine' ? (
                    <>
                      <i className="fas fa-user ml-2 text-[var(--primary-color)]"></i>
                      مقالاتي
                      {filters.status !== 'all' && (
                        <span className="text-sm text-[var(--text-secondary)] mr-2">
                          ({filters.status === 'published' && 'منشور'}
                          {filters.status === 'draft' && 'مسودة'}
                          {filters.status === 'archived' && 'مؤرشف'})
                        </span>
                      )}
                    </>
                  ) : filters.tags && filters.tags.length > 0 ? (
                    <>
                      <i className="fas fa-filter ml-2 text-[var(--primary-color)]"></i>
                      مقالات بوسم {filters.tags.map(t => `"#${t}"`).join('، ')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-newspaper ml-2 text-[var(--primary-color)]"></i>
                      جميع المقالات
                    </>
                  )}
                </h2>
                {filters.author === 'all' && (!filters.tags || filters.tags.length === 0) && (
                  <span className="text-sm text-[var(--text-secondary)]">
                    {articles.length} مقال
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
                </div>
              ) : articles.length === 0 ? (
                <AnimatedItem type="slideUp" delay={0.3}>
                  <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                    <i className="fas fa-search text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                      {filters.author === 'mine'
                        ? (filters.status === 'all' ? 'لم تنشر أي مقالات بعد' : `لا توجد مقالات ${filters.status === 'published' ? 'منشورة' : filters.status === 'draft' ? 'مسودة' : 'مؤرشفة'}`)
                        : filters.tags && filters.tags.length > 0
                        ? `لا توجد مقالات بوسم ${filters.tags.map(t => `"#${t}"`).join('، ')}`
                        : 'لا توجد مقالات بعد'}
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                      {filters.author === 'mine'
                        ? 'ابدأ بكتابة أول مقال لك'
                        : filters.tags && filters.tags.length > 0
                        ? 'جرب اختيار وسوم أخرى'
                        : 'تابعنا للحصول على مقالات جديدة قريباً'}
                    </p>
                    {(filters.tags && filters.tags.length > 0) || filters.author === 'mine' ? (
                      <div className="flex flex-col items-center gap-4">
                        <button
                          onClick={() => setFilters({ tags: [], author: 'all', status: 'all' })}
                          className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                        >
                          عرض جميع المقالات
                        </button>
                        {filters.author === 'mine' && user?.role === 'admin' && (
                          <button
                            onClick={() => navigate('/articles/manage')}
                            className="px-6 py-2 text-[var(--primary-color)] hover:text-[var(--primary-hover)] transition-colors flex items-center gap-2"
                          >
                            <i className="fas fa-plus"></i>
                            اكتب مقالاً جديداً
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </AnimatedItem>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {articles.map((article, index) => (
                      <AnimatedItem key={article._id} type="slideUp" delay={index * 0.05}>
                        <ArticleCard article={article} />
                      </AnimatedItem>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <AnimatedItem type="slideUp" delay={0.4}>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => {
                            loadArticles(pagination.currentPage - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={pagination.currentPage === 1}
                          className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i className="fas fa-chevron-right ml-2"></i>
                          السابق
                        </button>
                        <span className="px-6 py-3 text-[var(--text-secondary)]">
                          صفحة {pagination.currentPage} من {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => {
                            loadArticles(pagination.currentPage + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          disabled={pagination.currentPage === pagination.totalPages}
                          className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          التالي
                          <i className="fas fa-chevron-left ml-2"></i>
                        </button>
                      </div>
                    </AnimatedItem>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
