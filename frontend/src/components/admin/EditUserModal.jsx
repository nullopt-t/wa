import React, { useState } from 'react';

const EditUserModal = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    role: user.role || 'user',
    isActive: user.isActive !== false,
    isVerified: user.isVerified || false,
    isProfilePublic: user.isProfilePublic || false,
    phone: user.phone || '',
    bio: user.bio || '',
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'الاسم الأول مطلوب';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اسم العائلة مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
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
      await onSave(formData);
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">تعديل المستخدم</h2>
          <button
            onClick={onCancel}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                الاسم الأول <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                  errors.firstName ? 'border-red-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                اسم العائلة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                  errors.lastName ? 'border-red-500' : 'border-[var(--border-color)]'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                errors.email ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              الدور <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            >
              <option value="user">مستخدم</option>
              <option value="therapist">معالج</option>
              <option value="admin">مدير</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              نبذة تعريفية
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-[var(--text-primary)]">حساب نشط</p>
                <p className="text-sm text-[var(--text-secondary)]">السماح للمستخدم بتسجيل الدخول</p>
              </div>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-[var(--text-primary)]">تم التحقق</p>
                <p className="text-sm text-[var(--text-secondary)]">تم التحقق من البريد الإلكتروني</p>
              </div>
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleInputChange}
                className="w-5 h-5 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
              <div>
                <p className="font-medium text-[var(--text-primary)]">ملف عام</p>
                <p className="text-sm text-[var(--text-secondary)]">إظهار الملف الشخصي للمستخدمين الآخرين</p>
              </div>
              <input
                type="checkbox"
                name="isProfilePublic"
                checked={formData.isProfilePublic}
                onChange={handleInputChange}
                className="w-5 h-5 rounded"
              />
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
                  حفظ التغييرات
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

export default EditUserModal;
