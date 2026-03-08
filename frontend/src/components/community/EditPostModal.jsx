import React, { useState, useEffect } from 'react';

const EditPostModal = ({ post, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    tags: post?.tags?.join(', ') || '',
    isAnonymous: post?.isAnonymous || false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        tags: post.tags?.join(', ') || '',
        isAnonymous: post.isAnonymous || false,
      });
    }
  }, [post]);

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
      await onSubmit({
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isAnonymous: formData.isAnonymous,
      });
    } catch (error) {
      console.error('Failed to update post:', error);
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">تعديل المنشور</h2>
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
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-500 text-xl mt-0.5"></i>
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p className="font-medium mb-1">معلومة مهمة:</p>
                  <p>سيتم تحديث المنشور فوراً. التغييرات ستظهر لجميع المستخدمين.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[var(--border-color)]/30">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  حفظ التعديلات
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

export default EditPostModal;
