import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Quill editor modules configuration - NO image button since we have separate cover image
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'indent',
  'align',
  'blockquote', 'code-block',
  'link',
  'clean'
];

const ArticleForm = ({ article, onSubmit, onCancel, categories, disabled = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: null,
    coverImageFile: null,
    tags: '',
    categoryId: '',
    status: 'draft',
    isFeatured: false,
    readTime: 5,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const quillRef = useRef(null);

  // Populate form when editing
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        coverImage: article.coverImage || null,
        coverImageFile: null,
        tags: article.tags?.join(', ') || '',
        categoryId: article.categoryId?._id || '',
        status: article.status || 'draft',
        isFeatured: article.isFeatured || false,
        readTime: article.readTime || 5,
      });
      if (article.coverImage) {
        setImagePreview(article.coverImage.startsWith('/') ? `http://localhost:4000${article.coverImage}` : article.coverImage);
      }
    }
  }, [article]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !article) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
        .substring(0, 60);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, article]);

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

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, coverImage: 'يرجى اختيار صورة فقط' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, coverImage: 'حجم الصورة يجب أن يكون أقل من 5MB' }));
      return;
    }

    setErrors(prev => ({ ...prev, coverImage: '' }));
    setUploadingImage(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch('http://localhost:4000/api/upload/article-cover', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل رفع الصورة');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        coverImage: data.url,
        coverImageFile: file,
      }));
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, coverImage: error.message || 'فشل رفع الصورة' }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      coverImage: null,
      coverImageFile: null,
    }));
    setImagePreview(null);
    setErrors(prev => ({ ...prev, coverImage: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (formData.title.length < 10) {
      newErrors.title = 'العنوان يجب أن يكون 10 أحرف على الأقل';
    } else if (formData.title.length > 200) {
      newErrors.title = 'العنوان يجب أن يكون 200 حرف كحد أقصى';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'الرابط مطلوب';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      newErrors.slug = 'الرابط يجب أن يكون بالإنجليزية وبدون مسافات';
    } else if (formData.slug.length > 100) {
      newErrors.slug = 'الرابط يجب أن يكون 100 حرف كحد أقصى';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'الملخص مطلوب';
    } else if (formData.excerpt.length < 20) {
      newErrors.excerpt = 'الملخص يجب أن يكون 20 حرف على الأقل';
    } else if (formData.excerpt.length > 500) {
      newErrors.excerpt = 'الملخص يجب أن يكون 500 حرف كحد أقصى';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'المحتوى مطلوب';
    } else if (formData.content.length < 100) {
      newErrors.content = 'المحتوى يجب أن يكون 100 حرف على الأقل';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'يرجى اختيار قسم';
    }

    // Cover image is required
    if (!formData.coverImage && !article) {
      newErrors.coverImage = 'صورة الغلاف مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementsByName(firstError)[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImage: formData.coverImage,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        categoryId: formData.categoryId,
        status: formData.status,
        isFeatured: formData.isFeatured,
        readTime: parseInt(formData.readTime) || 5,
      };

      console.log('Submitting article:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-pen text-[var(--primary-color)]"></i>
          المعلومات الأساسية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              العنوان <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="اكتب عنوان المقال..."
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                errors.title ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
              <span>10-200 حرف</span>
              <span className={formData.title.length > 200 ? 'text-red-500' : ''}>{formData.title.length} حرف</span>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الرابط (Slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="article-title-in-english"
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] font-mono text-sm ${
                errors.slug ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
              <span>الحد الأقصى 100 حرف</span>
              <span className={formData.slug.length > 100 ? 'text-red-500' : ''}>{formData.slug.length} حرف</span>
            </div>
          </div>

          {/* Read Time */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              وقت القراءة (دقائق)
            </label>
            <input
              type="number"
              name="readTime"
              value={formData.readTime}
              onChange={handleInputChange}
              min="1"
              max="60"
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
          </div>

          {/* Excerpt */}
          <div className="md:col-span-2">
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الملخص <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="ملخص قصير للمقال (سيظهر في بطاقة المقال وفي محركات البحث)..."
              rows="3"
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors ${
                errors.excerpt ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt}</p>}
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
              <span>20-500 حرف</span>
              <span className={formData.excerpt.length > 500 ? 'text-red-500' : ''}>{formData.excerpt.length} حرف</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-file-alt text-[var(--primary-color)]"></i>
          المحتوى
        </h3>

        <div>
          <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
            محتوى المقال <span className="text-red-500">*</span>
          </label>
          
          {/* Rich Text Editor */}
          <div className="quill-custom rounded-xl overflow-hidden border border-[var(--border-color)]" dir="rtl">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={handleContentChange}
              modules={quillModules}
              formats={quillFormats}
              placeholder="اكتب محتوى المقال هنا... يمكنك تنسيق النص باستخدام الأزرار في الأعلى"
              className="quill-editor"
              style={{
                minHeight: '400px',
                fontSize: '16px',
                lineHeight: '1.8',
                fontFamily: 'inherit',
              }}
            />
            <style>{`
              .quill-custom .ql-toolbar {
                background: var(--card-bg);
                border-color: var(--border-color) !important;
                border-radius: 0.5rem 0.5rem 0 0;
              }
              .quill-custom .ql-container {
                background: var(--card-bg);
                border-color: var(--border-color) !important;
                border-radius: 0 0 0.5rem 0.5rem;
              }
              .quill-custom .ql-editor {
                background: var(--card-bg);
                color: var(--text-primary);
                min-height: 350px;
                font-size: 16px;
                line-height: 1.8;
              }
              .quill-custom .ql-editor.ql-blank::before {
                color: var(--text-secondary);
                font-style: normal;
              }
              .quill-custom .ql-stroke {
                stroke: var(--text-primary);
              }
              .quill-custom .ql-fill {
                fill: var(--text-primary);
              }
              .quill-custom .ql-picker {
                color: var(--text-primary);
              }
              .quill-custom .ql-picker-options {
                background: var(--card-bg);
                border-color: var(--border-color);
              }
              .quill-custom .ql-picker-item {
                color: var(--text-primary);
              }
              .quill-custom .ql-toolbar button:hover,
              .quill-custom .ql-toolbar button:focus,
              .quill-custom .ql-toolbar button.ql-active {
                color: var(--primary-color);
              }
              .quill-custom .ql-toolbar button:hover .ql-stroke,
              .quill-custom .ql-toolbar button:focus .ql-stroke,
              .quill-custom .ql-toolbar button.ql-active .ql-stroke {
                stroke: var(--primary-color);
              }
              .quill-custom .ql-toolbar button:hover .ql-fill,
              .quill-custom .ql-toolbar button:focus .ql-fill,
              .quill-custom .ql-toolbar button.ql-active .ql-fill {
                fill: var(--primary-color);
              }
              .quill-custom .ql-toolbar .ql-picker-label:hover,
              .quill-custom .ql-toolbar .ql-picker-label.ql-active {
                color: var(--primary-color);
              }
              .quill-custom .ql-toolbar .ql-picker-label:hover .ql-stroke,
              .quill-custom .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
                stroke: var(--primary-color);
              }
              .quill-custom .ql-toolbar .ql-picker-label:hover .ql-fill,
              .quill-custom .ql-toolbar .ql-picker-label.ql-active .ql-fill {
                fill: var(--primary-color);
              }
              .quill-custom .ql-toolbar.ql-snow {
                border-color: var(--border-color);
              }
              .quill-custom .ql-container.ql-snow {
                border-color: var(--border-color);
              }
              .quill-custom h1,
              .quill-custom h2,
              .quill-custom h3 {
                color: var(--text-primary);
                margin: 1rem 0;
              }
              .quill-custom p {
                color: var(--text-primary);
                margin-bottom: 1rem;
              }
              .quill-custom strong {
                color: var(--text-primary);
              }
              .quill-custom ul,
              .quill-custom ol {
                color: var(--text-primary);
              }
              .quill-custom blockquote {
                border-right: 4px solid var(--primary-color);
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
              }
            `}</style>
          </div>
          
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
            <span>محرر نصوص متقدم مع تنسيق كامل</span>
            <span>{formData.content.replace(/<[^>]*>/g, '').length} حرف</span>
          </div>
        </div>
      </div>

      {/* Media & Tags Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-image text-[var(--primary-color)]"></i>
          الوسائط والوسوم
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              صورة الغلاف <span className="text-red-500">*</span>
            </label>
            
            {/* Upload Area */}
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--primary-color)] transition-colors bg-[var(--card-bg)]">
                <div className="flex flex-col items-center justify-center pt-7 pb-6">
                  <i className="fas fa-cloud-upload-alt text-4xl text-[var(--text-secondary)] mb-3"></i>
                  <p className="mb-2 text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">انقر لرفع صورة</span> أو اسحبها هنا
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, WebP, GIF (الحد الأقصى 5MB)</p>
                </div>
                <input
                  type="file"
                  name="coverImageFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            ) : (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-xl border border-[var(--border-color)]"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin text-3xl text-white"></i>
                  </div>
                )}
                {!uploadingImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            )}
            
            {errors.coverImage && <p className="text-red-500 text-sm mt-2">{errors.coverImage}</p>}
            {imagePreview && !errors.coverImage && (
              <p className="text-xs text-green-500 mt-2">
                <i className="fas fa-check-circle ml-1"></i>
                تم رفع الصورة بنجاح
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الوسوم
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="صحة نفسية, قلق, اكتئاب"
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              افصل بين الوسوم بفواصل (،)
            </p>
            
            {/* Tags Preview */}
            {formData.tags && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-cog text-[var(--primary-color)]"></i>
          الإعدادات
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              القسم <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
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
            {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الحالة
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            >
              <option value="draft">مسودة (لن يظهر للعامة)</option>
              <option value="published">منشور (سيظهر للجميع)</option>
              <option value="archived">مؤرشف (مخزن للأرشيف)</option>
            </select>
            <div className="mt-2 px-3 py-2 bg-[var(--card-bg)] rounded-lg text-xs">
              {formData.status === 'draft' && (
                <span className="text-gray-500">📝 لن يظهر للعامة</span>
              )}
              {formData.status === 'published' && (
                <span className="text-green-500">✅ سيظهر للجميع</span>
              )}
              {formData.status === 'archived' && (
                <span className="text-blue-500">🗄️ مخزن للأرشيف</span>
              )}
            </div>
          </div>
        </div>

        {/* Featured */}
        <div className="mt-6 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
              className="w-5 h-5 text-[var(--primary-color)] rounded focus:ring-[var(--primary-color)] mt-1"
            />
            <label htmlFor="isFeatured" className="text-[var(--text-primary)] cursor-pointer flex-1">
              <span className="font-medium block mb-1">تثبيت كمقال مميز</span>
              <p className="text-sm text-[var(--text-secondary)]">
                سيظهر في قسم المقالات المميزة في الصفحة الرئيسية وفي أعلى القائمة
              </p>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]/30 sticky bottom-0 bg-[var(--bg-primary)] py-4 -mx-4 px-4">
        <button
          type="submit"
          disabled={loading || disabled}
          className="flex-1 px-6 py-4 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              {article ? 'جاري التحديث...' : 'جاري النشر...'}
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              {article ? 'تحديث المقال' : 'نشر المقال'}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={disabled}
          className="px-8 py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
