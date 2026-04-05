import React, { useState } from 'react';
import { booksAPI } from '../../services/communityApi.js';

const BookForm = ({ book, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    slug: book?.slug || '',
    author: book?.author || '',
    coverImage: book?.coverImage || '',
    fileUrl: book?.fileUrl || '',
    description: book?.description || '',
    pages: book?.pages || '',
    isFeatured: book?.isFeatured || false,
    isActive: book?.isActive !== false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-ء-ي]/g, '');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب';
    if (!formData.slug.trim()) newErrors.slug = 'الرابط مطلوب';
    if (!formData.author.trim()) newErrors.author = 'المؤلف مطلوب';
    if (!formData.description.trim()) newErrors.description = 'الوصف مطلوب';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bookData = {
        ...formData,
        pages: formData.pages ? parseInt(formData.pages) : undefined,
      };
      if (!bookData.coverImage) delete bookData.coverImage;
      if (!bookData.pages) delete bookData.pages;

      if (book) {
        await booksAPI.update(book._id, bookData);
      } else {
        await booksAPI.create(bookData);
      }
      onSuccess();
    } catch (error) {
      setErrors({ submit: error.message || 'فشل الحفظ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">{errors.submit}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">العنوان <span className="text-red-500">*</span></label>
          <input type="text" name="title" value={formData.title}
            onChange={(e) => { handleInputChange(e); if (!book) setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) })); }}
            className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${errors.title ? 'border-red-500' : 'border-[var(--border-color)]'}`}
            placeholder="عنوان الكتاب" />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">الرابط <span className="text-red-500">*</span></label>
          <input type="text" name="slug" value={formData.slug} onChange={handleInputChange}
            className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${errors.slug ? 'border-red-500' : 'border-[var(--border-color)]'}`}
            placeholder="عنوان-الكتاب" />
          {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
        </div>
      </div>

      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">المؤلف <span className="text-red-500">*</span></label>
        <input type="text" name="author" value={formData.author} onChange={handleInputChange}
          className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${errors.author ? 'border-red-500' : 'border-[var(--border-color)]'}`}
          placeholder="اسم المؤلف" />
        {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
      </div>

      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">الوصف <span className="text-red-500">*</span></label>
        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"
          className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors ${errors.description ? 'border-red-500' : 'border-[var(--border-color)]'}`}
          placeholder="وصف قصير للكتاب..." />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">صورة الغلاف</label>
        <input type="url" name="coverImage" value={formData.coverImage} onChange={handleInputChange}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="https://..." />
        {formData.coverImage && (
          <div className="mt-2">
            <img src={formData.coverImage} alt="Cover" className="w-32 h-48 object-cover rounded-lg border border-[var(--border-color)]" />
          </div>
        )}
      </div>

      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">رابط ملف الكتاب (PDF)</label>
        <input type="url" name="fileUrl" value={formData.fileUrl} onChange={handleInputChange}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="https://example.com/book.pdf" />
        <p className="text-xs text-[var(--text-secondary)] mt-1">يُترك فارغاً إذا لم يتوفر ملف</p>
      </div>

      <div>
        <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">عدد الصفحات</label>
        <input type="number" name="pages" value={formData.pages} onChange={handleInputChange} min="1"
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          placeholder="250" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-5 h-5 rounded" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">مميز</p>
            <p className="text-sm text-[var(--text-secondary)]">إظهار في الصفحة الرئيسية</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">نشط</p>
            <p className="text-sm text-[var(--text-secondary)]">إظهار للجمهور</p>
          </div>
        </label>
      </div>

      <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]">
        <button type="submit" disabled={loading}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? (<><i className="fas fa-spinner fa-spin"></i>جاري الحفظ...</>) : (<><i className="fas fa-save"></i>{book ? 'تحديث' : 'إضافة'}</>)}
        </button>
        <button type="button" onClick={onCancel}
          className="px-8 py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-semibold hover:bg-[var(--bg-secondary)] transition-colors">إلغاء</button>
      </div>
    </form>
  );
};

export default BookForm;
