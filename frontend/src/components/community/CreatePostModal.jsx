import React, { useState } from 'react';

const CreatePostModal = ({ categories, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: '',
    isAnonymous: false,
  });
  const [images, setImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // Track per-image upload status
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'الحد الأقصى 5 صور' }));
      return;
    }

    const newImages = [];
    const newPreviews = [];

    // First, mark all new images as uploading
    const startIndex = imagePreviews.length;
    const initialProgress = {};
    
    files.forEach((file, fileIndex) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, images: 'يرجى اختيار صور فقط' }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, images: `حجم الصورة ${file.name} يتجاوز 5MB` }));
        return;
      }

      newImages.push(file);
      initialProgress[startIndex + fileIndex] = true;
    });

    // Set all as uploading immediately
    if (Object.keys(initialProgress).length > 0) {
      setUploadProgress(prev => ({ ...prev, ...initialProgress }));
    }

    // Create previews
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      setErrors(prev => ({ ...prev, images: '' }));
      
      // Upload images immediately
      setUploading(true);
      try {
        const formDataImages = new FormData();
        newImages.forEach(image => {
          formDataImages.append('images', image);
        });

        const uploadResponse = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formDataImages,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || 'فشل رفع الصور');
        }

        const uploadData = await uploadResponse.json();
        const uploadedUrls = uploadData.files.map(file => file.url);
        setUploadedImages(prev => [...prev, ...uploadedUrls]);
        
        // Minimum loading time for better UX (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark all as uploaded
        const completedProgress = {};
        for (let i = 0; i < newImages.length; i++) {
          completedProgress[startIndex + i] = false;
        }
        setUploadProgress(prev => ({ ...prev, ...completedProgress }));
      } catch (error) {
        console.error('Upload error:', error);
        setErrors(prev => ({ ...prev, images: error.message }));
        // Mark as failed (not uploading)
        const failedProgress = {};
        for (let i = 0; i < newImages.length; i++) {
          failedProgress[startIndex + i] = false;
        }
        setUploadProgress(prev => ({ ...prev, ...failedProgress }));
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = {};
      Object.keys(prev).forEach(key => {
        const numKey = parseInt(key);
        if (numKey < index) {
          newProgress[numKey] = prev[key];
        } else if (numKey > index) {
          newProgress[numKey - 1] = prev[key];
        }
      });
      return newProgress;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (formData.title.length > 200) {
      newErrors.title = 'العنوان يجب أن يكون أقل من 200 حرف';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'المحتوى مطلوب';
    } else if (formData.content.length < 50) {
      newErrors.content = 'المحتوى يجب أن يكون 50 حرف على الأقل';
    } else if (formData.content.length > 5000) {
      newErrors.content = 'المحتوى يجب أن يكون أقل من 5000 حرف';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'يرجى اختيار قسم';
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
      // Submit post with already uploaded images
      await onSubmit({
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        images: uploadedImages,
        isAnonymous: formData.isAnonymous,
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">إنشاء منشور جديد</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="اكتب عنوان المنشور..."
                className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] ${
                  errors.title ? 'border-red-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                القسم <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] ${
                  errors.categoryId ? 'border-red-500' : 'border-[var(--border-color)]'
                }`}
              >
                <option value="">اختر القسم...</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.nameAr}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                المحتوى <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="شارك تجربتك أو اطرح سؤالك..."
                rows="8"
                className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none ${
                  errors.content ? 'border-red-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {formData.content.length} / 5000 حرف
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                الوسوم (اختياري)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="مثال: قلق، اكتئاب، علاج (افصل بينها بفواصل)"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                الصور (اختياري - الحد الأقصى 5 صور)
              </label>
              <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-[var(--primary-color)] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <i className="fas fa-cloud-upload-alt text-4xl text-[var(--text-secondary)] mb-2"></i>
                  <p className="text-[var(--text-primary)] font-medium">انقر لرفع الصور</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">JPEG, PNG, WebP, GIF (الحد الأقصى 5MB لكل صورة)</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-32 object-cover rounded-lg ${uploadProgress[index] ? 'opacity-70' : ''}`}
                      />
                      {uploadProgress[index] && (
                        <>
                          {/* Spinner */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <i className="fas fa-spinner fa-spin text-3xl text-white"></i>
                          </div>
                          {/* Progress Bar */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--primary-color)] rounded-full animate-pulse w-2/3"></div>
                            </div>
                          </div>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={uploadProgress[index]}
                        className="absolute top-1 right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <p className="text-red-500 text-sm mt-2">{errors.images}</p>
              )}
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isAnonymous"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-5 h-5 text-[var(--primary-color)] rounded focus:ring-[var(--primary-color)]"
              />
              <label htmlFor="isAnonymous" className="text-[var(--text-primary)] cursor-pointer">
                نشر بشكل مجهول
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">معلومة مهمة:</p>
                  <p>سيتم مراجعة المنشور قبل نشره. هذه العملية قد تستغرق حتى 24 ساعة.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[var(--border-color)]/30">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  نشر المنشور
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
