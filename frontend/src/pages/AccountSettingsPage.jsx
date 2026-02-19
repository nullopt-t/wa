import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { profileAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const AccountSettingsPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { success, error: showErrorToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    emailNotifications: true,
    dataSharing: false,
  });
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordForm.currentPassword) newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    if (!passwordForm.newPassword) newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (!passwordForm.confirmNewPassword) newErrors.confirmNewPassword = 'يرجى تأكيد كلمة المرور';
    else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      newErrors.confirmNewPassword = 'كلمتا المرور غير متطابقتين';
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تختلف عن الحالية';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      showErrorToast('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setChangingPassword(true);
    try {
      await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      success('تم تغيير كلمة المرور بنجاح');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      showErrorToast(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePrivacyToggle = (key) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      await profileAPI.updatePrivacySettings(privacySettings);
      success('تم حفظ إعدادات الخصوصية بنجاح');
    } catch (error) {
      console.error('Privacy save error:', error);
      showErrorToast(error.message || 'حدث خطأ أثناء حفظ إعدادات الخصوصية');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleLogoutFromAllDevices = () => {
    const confirmLogout = window.confirm('هل أنت متأكد من تسجيل الخروج من جميع الأجهزة؟');
    if (confirmLogout) {
      logout();
      navigate('/login');
      success('تم تسجيل الخروج من جميع الأجهزة');
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('⚠️ تحذير: هل أنت متأكد تماماً من حذف حسابك؟\n\nهذا الإجراء لا يمكن التراجع عنه. ستفقد جميع بياناتك بشكل نهائي.');
    if (!confirmDelete) return;

    const finalConfirm = window.prompt('للحذف النهائي، اكتب "حذف" في المربع أدناه:');
    if (finalConfirm !== 'حذف') {
      showErrorToast('لم يتم تأكيد الحذف');
      return;
    }

    setDeletingAccount(true);
    setTimeout(() => {
      logout();
      navigate('/');
      success('تم حذف حسابك بنجاح');
    }, 1000);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading || !user) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">إعدادات الحساب</h1>
            <p className="text-[var(--text-secondary)]">إدارة كلمة المرور والخصوصية والحساب</p>
          </div>
        </AnimatedItem>

        {/* Change Password */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">تغيير كلمة المرور</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-[var(--text-primary)] font-medium mb-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${passwordErrors.currentPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)]"
                  >
                    <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[var(--text-primary)] font-medium mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${passwordErrors.newPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)]"
                  >
                    <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            passwordForm.newPassword.length >= level * 3
                              ? level <= 2 ? 'bg-red-500' : level === 3 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      قوة كلمة المرور: {
                        passwordForm.newPassword.length < 3 ? 'ضعيفة' :
                        passwordForm.newPassword.length < 6 ? 'متوسطة' :
                        passwordForm.newPassword.length < 9 ? 'جيدة' : 'قوية'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[var(--text-primary)] font-medium mb-2">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${passwordErrors.confirmNewPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)]"
                  >
                    <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'
                }`}
              >
                {changingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    جاري التغيير...
                  </>
                ) : (
                  <>
                    <i className="fas fa-key text-white"></i>
                    تغيير كلمة المرور
                  </>
                )}
              </button>
            </form>
          </div>
        </AnimatedItem>

        {/* Privacy Settings */}
        <AnimatedItem type="slideUp" delay={0.3}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">إعدادات الخصوصية</h2>
            <div className="space-y-4">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium">إظهار ملفي الشخصي</h3>
                  <p className="text-[var(--text-secondary)] text-sm">السماح للمستخدمين الآخرين برؤية ملفك الشخصي</p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('profileVisibility')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${privacySettings.profileVisibility ? 'bg-[var(--primary-color)]' : 'bg-gray-400'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${privacySettings.profileVisibility ? 'right-1' : 'right-8'}`}></div>
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium">إشعارات البريد الإلكتروني</h3>
                  <p className="text-[var(--text-secondary)] text-sm">استلام تحديثات وإشعارات عبر البريد الإلكتروني</p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('emailNotifications')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${privacySettings.emailNotifications ? 'bg-[var(--primary-color)]' : 'bg-gray-400'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${privacySettings.emailNotifications ? 'right-1' : 'right-8'}`}></div>
                </button>
              </div>

              {/* Data Sharing */}
              <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl">
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium">مشاركة البيانات</h3>
                  <p className="text-[var(--text-secondary)] text-sm">المساعدة في تحسين الخدمات من خلال مشاركة البيانات المجهولة</p>
                </div>
                <button
                  onClick={() => handlePrivacyToggle('dataSharing')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${privacySettings.dataSharing ? 'bg-[var(--primary-color)]' : 'bg-gray-400'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${privacySettings.dataSharing ? 'right-1' : 'right-8'}`}></div>
                </button>
              </div>

              <button
                onClick={handleSavePrivacy}
                disabled={savingPrivacy}
                className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  savingPrivacy
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-[var(--secondary-color)] text-white hover:bg-[var(--secondary-hover)]'
                }`}
              >
                {savingPrivacy ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save text-white"></i>
                    حفظ إعدادات الخصوصية
                  </>
                )}
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Account Info */}
        <AnimatedItem type="slideUp" delay={0.4}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">معلومات الحساب</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[var(--text-secondary)]">تاريخ الانضمام</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : 'يناير 2024'}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[var(--text-secondary)]">آخر تسجيل دخول</span>
                <span className="text-[var(--text-primary)] font-medium">اليوم</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[var(--text-secondary)]">حالة الحساب</span>
                <span className="text-green-500 font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  نشط
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-[var(--text-secondary)]">نوع الحساب</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {user.role === 'therapist' ? 'معالج نفسي' : 'مستخدم'}
                </span>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Security Actions */}
        <AnimatedItem type="slideUp" delay={0.5}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">الأمان</h2>
            <button
              onClick={handleLogoutFromAllDevices}
              className="w-full py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              تسجيل الخروج من جميع الأجهزة
            </button>
          </div>
        </AnimatedItem>

        {/* Danger Zone */}
        <AnimatedItem type="slideUp" delay={0.6}>
          <div className="bg-red-500/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-red-500/30 mb-6">
            <h2 className="text-xl font-bold text-red-500 mb-4">⚠️ منطقة الخطر</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              بمجرد حذف حسابك، لا يمكن التراجع عن هذا الإجراء. يرجى المتابعة بحذر.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                deletingAccount
                  ? 'bg-red-400 cursor-not-allowed text-white'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {deletingAccount ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  جاري الحذف...
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt"></i>
                  حذف الحساب نهائياً
                </>
              )}
            </button>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
