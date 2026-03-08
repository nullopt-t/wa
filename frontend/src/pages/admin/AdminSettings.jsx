import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import { settingsAPI } from '../../services/communityApi.js';

const AdminSettings = () => {
  const { success, error: showError } = useToast();
  const [settings, setSettings] = useState({
    siteDescription: 'منصة الصحة النفسية العربية',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    maxUploadSize: '5',
    contactEmail: 'info@waey.com',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.update(settings);
      success('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      showError('فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إعدادات المنصة">
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <i className="fas fa-cog text-[var(--primary-color)]"></i>
              الإعدادات العامة
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  وصف الموقع
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  بريد التواصل
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* User Settings */}
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <i className="fas fa-users text-[var(--primary-color)]"></i>
              إعدادات المستخدمين
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">السماح بالتسجيلات الجديدة</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">السماح للمستخدمين الجدد بإنشاء حسابات</p>
                </div>
                <input
                  type="checkbox"
                  name="allowRegistrations"
                  checked={settings.allowRegistrations}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">التحقق من البريد الإلكتروني</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">اشتراط التحقق من البريد الإلكتروني للتسجيل</p>
                </div>
                <input
                  type="checkbox"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">وضع الصيانة</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">تعطيل الوصول للموقع مؤقتاً</p>
                </div>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>
          </div>

          {/* Upload Settings */}
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <i className="fas fa-upload text-[var(--primary-color)]"></i>
              إعدادات الرفع
            </h2>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                الحد الأقصى لحجم الملف (MB)
              </label>
              <input
                type="number"
                name="maxUploadSize"
                value={settings.maxUploadSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                الحد الأقصى لحجم الملفات المسموح برفعها
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>
      </AnimatedItem>
    </AdminLayout>
  );
};

export default AdminSettings;
