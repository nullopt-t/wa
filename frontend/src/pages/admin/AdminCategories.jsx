import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { categoriesAPI } from '../../services/communityApi.js';

const AdminCategories = () => {
  const { success, error: showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getAll();
      
      // Handle different API response structures
      const categoriesList = Array.isArray(data) ? data : (data.categories || data.data || []);
      setCategories(categoriesList);
    } catch (error) {
      
      ;
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await categoriesAPI.delete(categoryToDelete._id);
      success('تم حذف القسم بنجاح');
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (error) {
      showError('فشل حذف القسم');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const handleSaveSuccess = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    success(editingCategory ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح');
    loadCategories();
  };

  return (
    <AdminLayout title="إدارة الأقسام">
      {/* Header Actions */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            إضافة قسم
          </button>
        </div>
      </AnimatedItem>

      {/* Categories Grid */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <i className="fas fa-folder text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد أقسام بعد</h3>
              <p className="text-[var(--text-secondary)] mb-6">ابدأ بإضافة أول قسم</p>
              <button
                onClick={handleAddClick}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة قسم
              </button>
            </div>
          ) : (
            categories.map((category, index) => (
              <AnimatedItem key={category._id} type="slideUp" delay={index * 0.05}>
                <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: category.color }}
                    >
                      <i className={`fas ${category.icon}`}></i>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <i className="fas fa-pen"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{category.nameAr}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">{category.name}</p>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>الترتيب: {category.order}</span>
                    <span className="px-2 py-1 bg-[var(--bg-secondary)] rounded" style={{ color: category.color }}>
                      {category.color}
                    </span>
                  </div>
                </div>
              </AnimatedItem>
            ))
          )}
        </div>
      </AnimatedItem>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف القسم"
        message={`هل أنت متأكد من حذف قسم "${categoryToDelete?.nameAr}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <CategoryFormModal
          category={editingCategory}
          onSuccess={handleSaveSuccess}
          onCancel={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

// Category Form Modal Component
const CategoryFormModal = ({ category, onSuccess, onCancel }) => {
  const { error: showError } = useToast();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    nameAr: category?.nameAr || '',
    icon: category?.icon || 'fa-folder',
    color: category?.color || '#c5a98e',
    order: category?.order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const iconOptions = [
    { value: 'fa-newspaper', label: 'مقال' },
    { value: 'fa-video', label: 'فيديو' },
    { value: 'fa-users', label: 'مجتمع' },
    { value: 'fa-envelope', label: 'رسالة' },
    { value: 'fa-calendar', label: 'جلسات' },
    { value: 'fa-user-md', label: 'معالج' },
    { value: 'fa-book', label: 'كتب' },
    { value: 'fa-graduation-cap', label: 'تعليم' },
    { value: 'fa-heart', label: 'صحة' },
    { value: 'fa-brain', label: 'نفسية' },
  ];

  const colorOptions = [
    '#c5a98e', '#8b5cf6', '#10b981', '#f59e0b',
    '#3b82f6', '#ef4444', '#ec4899', '#14b8a6',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'الاسم العربي مطلوب';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم الإنجليزي مطلوب';
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
      if (category) {
        // Update existing
        await categoriesAPI.update(category._id, formData);
      } else {
        // Create new
        await categoriesAPI.create(formData);
      }
      
      onSuccess();
    } catch (error) {
      showError(error.message || 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {category ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name AR */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الاسم العربي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nameAr"
              value={formData.nameAr}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                errors.nameAr ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
              placeholder="المقالات"
            />
            {errors.nameAr && <p className="text-red-500 text-sm mt-1">{errors.nameAr}</p>}
          </div>

          {/* Name EN */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الاسم الإنجليزي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                errors.name ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
              placeholder="Articles"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              الأيقونة
            </label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.icon === icon.value
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10'
                      : 'border-[var(--border-color)] hover:border-[var(--primary-color)]/50'
                  }`}
                >
                  <i className={`fas ${icon.value} text-xl text-[var(--text-primary)]`}></i>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              اللون
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-full h-12 rounded-xl border-2 transition-all ${
                    formData.color === color
                      ? 'border-[var(--primary-color)] scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full h-12 mt-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl"
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
                  {category ? 'تحديث القسم' : 'إضافة قسم'}
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
      </div>
    </div>
  );
};

export default AdminCategories;
