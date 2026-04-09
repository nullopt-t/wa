import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { videosAPI } from '../services/communityApi.js';

const VideosPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({ category: 'all', tag: 'all' });
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadVideos();
    loadFeaturedVideos();
  }, []);

  const loadFeaturedVideos = async () => {
    try {
      const data = await videosAPI.getFeatured(6);
      setFeaturedVideos(data);
    } catch (error) {

    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await videosAPI.getAll({ limit: 100, excludeFeatured: 'true' });
      const allVids = data.videos || [];
      setAllVideos(allVids);
      setVideos(allVids);

      // Extract unique categories
      const categories = [...new Set(allVids.map(v => v.category).filter(Boolean))];
      setAllCategories(categories);

      // Extract unique tags
      const tagsSet = new Set();
      allVids.forEach(v => {
        if (v.tags && Array.isArray(v.tags)) {
          v.tags.forEach(t => tagsSet.add(t));
        }
      });
      setAllTags(Array.from(tagsSet));
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...allVideos];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.title?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(v => v.category === filters.category);
    }

    // Tag filter
    if (filters.tag !== 'all') {
      filtered = filtered.filter(v => v.tags?.includes(filters.tag));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most-viewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'a-z':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ar'));
        break;
    }

    setVideos(filtered);
  }, [searchQuery, sortBy, filters, allVideos]);

  const getYouTubeEmbed = (url) => {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">فيديوهات وعي</h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
            مكتبة فيديوهات تعليمية وتحفيزية للصحة النفسية
          </p>
          {isAdmin && (
            <Link
              to="/videos/manage"
              className="inline-block mt-6 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              <i className="fas fa-plus ml-2"></i>
              إضافة فيديو
            </Link>
          )}
        </div>
      </section>

      {/* Filters Bar */}
      <section className="py-6 bg-[var(--card-bg)] border-y border-[var(--border-color)]/30 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن فيديو..."
                  className="w-full px-4 py-2.5 pr-10 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)]"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"></i>
              </div>
            </div>

            {/* Category Filter */}
            {allCategories.length > 0 && (
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)]"
              >
                <option value="all">كل الفئات</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={filters.tag}
                onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
                className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)]"
              >
                <option value="all">كل الوسوم</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)]"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="most-viewed">الأكثر مشاهدة</option>
              <option value="a-z">أبجدياً</option>
            </select>
          </div>

          {/* Results count */}
          {(searchQuery || filters.category !== 'all' || filters.tag !== 'all') && (
            <div className="mt-3 text-sm text-[var(--text-secondary)]">
              <span className="text-[var(--primary-color)] font-medium">{videos.length}</span> نتيجة
              {searchQuery && <span> عن "{searchQuery}"</span>}
            </div>
          )}
        </div>
      </section>

      {/* Featured Videos */}
      {featuredVideos.length > 0 && !searchQuery && filters.category === 'all' && (
        <section className="py-12 bg-[var(--bg-secondary)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-right">
              <i className="fas fa-star text-[var(--primary-color)] ml-2"></i>
              فيديوهات مميزة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((video, index) => (
                <AnimatedItem key={video._id} type="slideUp" delay={index * 0.05}>
                  <VideoCard video={video} getYouTubeEmbed={getYouTubeEmbed} formatDuration={formatDuration} />
                </AnimatedItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Videos */}
      <section className="py-12 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-right">
            <i className="fas fa-video text-[var(--primary-color)] ml-2"></i>
            جميع الفيديوهات
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/30">
              <i className="fas fa-video text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {searchQuery || filters.category !== 'all' ? 'لا توجد نتائج' : 'لا توجد فيديوهات بعد'}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {searchQuery || filters.category !== 'all'
                  ? 'جرب تغيير معايير البحث'
                  : 'تابعنا للحصول على فيديوهات جديدة قريباً'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <AnimatedItem key={video._id} type="slideUp" delay={index * 0.05}>
                  <VideoCard video={video} getYouTubeEmbed={getYouTubeEmbed} formatDuration={formatDuration} />
                </AnimatedItem>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, getYouTubeEmbed, formatDuration }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 hover:shadow-xl">
      {/* Video Thumbnail/Player */}
      <div className="relative aspect-video bg-[var(--bg-secondary)]">
        {isPlaying ? (
          <iframe
            src={getYouTubeEmbed(video.videoUrl)}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsPlaying(true)}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <div className="w-20 h-20 bg-[var(--primary-color)] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <i className="fas fa-play text-3xl text-white ml-1"></i>
                </div>
              </div>
            )}
            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{video.description}</p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <i className="fas fa-eye"></i>
            <span>{video.views || 0} مشاهدة</span>
          </div>
          {video.category && (
            <span className="px-2 py-1 bg-[var(--bg-secondary)] rounded-full">{video.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
