import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { videosAPI } from '../services/communityApi.js';

const VideosPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);

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
      console.error('Failed to load featured videos:', error);
    }
  };

  const loadVideos = async () => {
    try {
      setLoading(true);
      // Exclude featured videos from main list (they're shown separately)
      const data = await videosAPI.getAll({ limit: 50, excludeFeatured: 'true' });
      setVideos(data.videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
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
            <div className="text-center py-20">
              <i className="fas fa-video text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد فيديوهات بعد</h3>
              <p className="text-[var(--text-secondary)]">تابعنا للحصول على فيديوهات جديدة قريباً</p>
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
