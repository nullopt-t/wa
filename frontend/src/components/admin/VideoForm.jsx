import React, { useState } from 'react';
import { videosAPI } from '../../services/communityApi.js';

const VideoForm = ({ video, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    videoUrl: video?.videoUrl || '',
    thumbnailUrl: video?.thumbnailUrl || '',
    duration: video?.duration || 0,
    category: video?.category || '',
    tags: video?.tags?.join(', ') || '',
    isFeatured: video?.isFeatured || false,
    isActive: video?.isActive !== false,
    order: video?.order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (formData.title.length < 5) {
      newErrors.title = 'الحد الأدنى 5 أحرف';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'الوصف مطلوب';
    } else if (formData.description.length < 20) {
      newErrors.description = 'الحد الأدنى 20 حرف';
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'رابط الفيديو مطلوب';
    } else if (!formData.videoUrl.includes('youtube.com') && !formData.videoUrl.includes('vimeo.com')) {
      newErrors.videoUrl = 'يرجى استخدام يوتيوب أو فيميو';
    }

    if (formData.duration && formData.duration < 10) {
      newErrors.duration = 'الحد الأدنى 10 ثواني';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const videoData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (video) {
        // Update existing
        await videosAPI.update(video._id, videoData);
      } else {
        // Create new
        await videosAPI.create(videoData);
      }

      onSuccess();
    } catch (error) {
      setErrors({ submit: error.message || 'فشل الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailFromUrl = () => {
    const videoId = extractVideoId(formData.videoUrl);
    if (videoId) {
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setFormData(prev => ({ ...prev, thumbnailUrl: thumbnail }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
          {errors.submit}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          عنوان الفيديو <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
            errors.title ? 'border-red-500' : 'border-[var(--border-color)]'
          }`}
          placeholder="مثال: كيفية التعامل مع القلق"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          وصف الفيديو <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors ${
            errors.description ? 'border-red-500' : 'border-[var(--border-color)]'
          }`}
          placeholder="وصف قصير لمحتوى الفيديو..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
          <span>20+ حرف</span>
          <span className={formData.description.length < 20 ? 'text-red-500' : ''}>
            {formData.description.length} حرف
          </span>
        </div>
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          رابط الفيديو <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            onBlur={getThumbnailFromUrl}
            className={`flex-1 px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
              errors.videoUrl ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <button
            type="button"
            onClick={getThumbnailFromUrl}
            className="px-4 py-3 bg-[var(--bg-secondary)] text-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-colors"
            title="استخراج الصورة المصغرة"
          >
            <i className="fas fa-image"></i>
          </button>
        </div>
        {errors.videoUrl && <p className="text-red-500 text-sm mt-1">{errors.videoUrl}</p>}
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          يدعم يوتيوب وفيميو فقط
        </p>
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          الصورة المصغرة
        </label>
        <input
          type="url"
          name="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="https://..."
        />
        {formData.thumbnailUrl && (
          <div className="mt-2">
            <img
              src={formData.thumbnailUrl}
              alt="Thumbnail preview"
              className="w-full max-w-xs rounded-lg border border-[var(--border-color)]"
            />
          </div>
        )}
      </div>

      {/* Duration & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
            المدة (ثواني)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
              errors.duration ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            placeholder="300"
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>

        <div>
          <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
            القسم
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            placeholder="تعليمي، توعية، ..."
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          الوسوم (مفصولة بفاصلة)
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="صحة نفسية, قلق, توعية"
        />
      </div>

      {/* Order */}
      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
          الترتيب
        </label>
        <input
          type="number"
          name="order"
          value={formData.order}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="0"
        />
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          الأرقام الأصغر تظهر أولاً
        </p>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleInputChange}
            className="w-5 h-5 rounded"
          />
          <div>
            <p className="font-medium text-[var(--text-primary)]">مميز</p>
            <p className="text-sm text-[var(--text-secondary)]">إظهار في الصفحة الرئيسية</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-5 h-5 rounded"
          />
          <div>
            <p className="font-medium text-[var(--text-primary)]">نشط</p>
            <p className="text-sm text-[var(--text-secondary)]">إظهار للجمهور</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              جاري الحفظ...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              {video ? 'تحديث الفيديو' : 'إضافة فيديو'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
