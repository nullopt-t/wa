import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { videosAPI } from '../services/communityApi.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import VideoForm from '../components/admin/VideoForm.jsx';

const VideoManagementPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, featured, active, inactive
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      showError('يرجى تسجيل الدخول للوصول إلى هذه الصفحة');
      navigate('/login');
      return;
    }
    loadVideos();
  }, [isAuthenticated]);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await videosAPI.getAllForAdmin({ limit: 50 });
      // Handle different API response structures
      const videosList = data.videos || data.data || data;
      setVideos(Array.isArray(videosList) ? videosList : []);
    } catch (error) {
      console.error('Failed to load videos:', error);
      showError('فشل تحميل الفيديوهات');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;

    try {
      await videosAPI.delete(videoToDelete._id);
      success('تم حذف الفيديو بنجاح');
      setShowDeleteConfirm(false);
      setVideoToDelete(null);
      loadVideos();
    } catch (error) {
      showError('فشل حذف الفيديو');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
  };

  const handlePreviewClick = (video) => {
    setPreviewVideo(video);
    setShowPreviewModal(true);
  };

  const handlePreviewClose = () => {
    setShowPreviewModal(false);
    setPreviewVideo(null);
  };

  const filteredVideos = videos.filter(video => {
    // Filter by status
    if (filterStatus === 'featured' && !video.isFeatured) return false;
    if (filterStatus === 'active' && !video.isActive) return false;
    if (filterStatus === 'inactive' && video.isActive) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return video.title?.toLowerCase().includes(search) ||
        video.description?.toLowerCase().includes(search) ||
        video.category?.toLowerCase().includes(search);
    }

    return true;
  });

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">إدارة الفيديوهات</h1>
              <p className="text-[var(--text-secondary)]">أضف وأدر الفيديوهات التعليمية</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              فيديو جديد
            </button>
          </div>
        </AnimatedItem>

        {/* Filters */}
        <AnimatedItem type="slideUp" delay={0.15}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  بحث
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو الوصف..."
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
              </div>
              {/* Filter by Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  تصفية حسب الحالة
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                >
                  <option value="all">الكل</option>
                  <option value="featured">مميز ⭐</option>
                  <option value="active">نشط ✅</option>
                  <option value="inactive">غير نشط ❌</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-[var(--text-secondary)]">
                عرض {filteredVideos.length} من {videos.length} فيديو
              </p>
              {filterStatus !== 'all' || searchTerm ? (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-[var(--primary-color)] hover:underline"
                >
                  مسح الفلاتر
                </button>
              ) : null}
            </div>
          </div>
        </AnimatedItem>

        {/* Videos List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : videos.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
              <i className="fas fa-video text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد فيديوهات بعد</h3>
              <p className="text-[var(--text-secondary)] mb-6">ابدأ بإضافة أول فيديو</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة فيديو
              </button>
            </div>
          </AnimatedItem>
        ) : (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الفيديو</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">مميز</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredVideos.map((video) => (
                      <tr key={video._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center flex-shrink-0">
                              <i className="fas fa-video text-[var(--primary-color)]"></i>
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)] mb-1">{video.title}</p>
                              <p className="text-sm text-[var(--text-secondary)] truncate max-w-md">{video.description.substring(0, 80)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            video.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {video.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {video.isFeatured ? (
                            <i className="fas fa-star text-yellow-500"></i>
                          ) : (
                            <i className="far fa-star text-[var(--text-secondary)]"></i>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePreviewClick(video)}
                              className="p-2 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                              title="معاينة"
                            >
                              <i className="fas fa-play"></i>
                            </button>
                            <button
                              onClick={() => setEditingVideo(video)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(video)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف الفيديو"
        message="هل أنت متأكد من حذف هذا الفيديو؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Add/Edit Modal */}
      {(showAddModal || editingVideo) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingVideo(null); }}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setEditingVideo(null); }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <VideoForm
                video={editingVideo}
                onSuccess={() => {
                  setShowAddModal(false);
                  setEditingVideo(null);
                  success(editingVideo ? 'تم تحديث الفيديو بنجاح' : 'تم إضافة الفيديو بنجاح');
                  loadVideos();
                }}
                onCancel={() => { setShowAddModal(false); setEditingVideo(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {showPreviewModal && previewVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handlePreviewClose}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-5xl overflow-hidden">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{previewVideo.title}</h2>
              <button
                onClick={handlePreviewClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <div className="p-6">
              {/* Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6">
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideo.videoUrl.split('v=')[1]?.split('&')[0] || previewVideo.videoUrl.split('/').pop()}`}
                  title={previewVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {/* Video Info */}
              <div className="space-y-4">
                <p className="text-[var(--text-primary)]">{previewVideo.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-eye"></i>
                    <span>{previewVideo.views || 0} مشاهدة</span>
                  </div>
                  {previewVideo.duration && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-clock"></i>
                      <span>{Math.floor(previewVideo.duration / 60)}:{(previewVideo.duration % 60).toString().padStart(2, '0')} دقيقة</span>
                    </div>
                  )}
                  {previewVideo.category && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-folder"></i>
                      <span>{previewVideo.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <i className={`fas fa-${previewVideo.isFeatured ? 'star' : 'circle'}`}></i>
                    <span>{previewVideo.isFeatured ? 'مميز' : 'عادي'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className={`fas fa-${previewVideo.isActive ? 'check' : 'times'}`}></i>
                    <span>{previewVideo.isActive ? 'نشط' : 'غير نشط'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagementPage;
