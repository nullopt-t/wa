import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { profileAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const ProfileSettingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error: showErrorToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    avatar: '',
    // Therapist fields
    licenseNumber: '',
    specialty: '',
    yearsOfExperience: '',
    education: '',
    certifications: '',
    clinicAddress: '',
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        avatar: user.avatar || '',
        licenseNumber: user.licenseNumber || '',
        specialty: user.specialty || '',
        yearsOfExperience: user.yearsOfExperience || '',
        education: user.education?.[0] || '',
        certifications: user.certifications?.join(', ') || '',
        clinicAddress: user.clinicAddress || '',
      });
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) newErrors.phone = 'رقم الهاتف غير صحيح';
    if (formData.yearsOfExperience && (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50)) {
      newErrors.yearsOfExperience = 'سنوات الخبرة يجب أن تكون بين 0 و 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const result = await profileAPI.uploadAvatar(user.id, formData);
        
        if (result.success) {
          setFormData(prev => ({ ...prev, avatar: result.avatarUrl }));
          success('تم رفع الصورة الشخصية بنجاح');
        }
      } catch (error) {
        console.error('Avatar upload error:', error);
        showErrorToast(error.message || 'حدث خطأ أثناء رفع الصورة');
        // Revert preview on error
        setAvatarPreview(user.avatar);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setSaving(true);
    try {
      const updateData = { ...formData };

      // Convert certifications string to array
      if (updateData.certifications) {
        updateData.certifications = updateData.certifications.split(',').map(s => s.trim()).filter(s => s);
      }

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      await profileAPI.updateProfile(user.id, updateData);
      success('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Profile update error:', error);
      showErrorToast(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmCancel = window.confirm('هل أنت متأكد من إلغاء التغييرات؟');
      if (!confirmCancel) return;
    }
    navigate('/dashboard');
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
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">إعدادات الملف الشخصي</h1>
            <p className="text-[var(--text-secondary)]">قم بتحديث معلوماتك الشخصية والمهنية</p>
          </div>
        </AnimatedItem>

        {/* Profile Picture */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">الصورة الشخصية</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent-amber)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--accent-amber)]/80 transition-colors">
                  <i className="fas fa-camera text-white text-sm"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-2">رفع صورة شخصية</p>
                <p className="text-[var(--text-secondary)] text-sm">PNG أو JPG بحد أقصى 5 ميجابايت</p>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Personal Information */}
        <AnimatedItem type="slideUp" delay={0.3}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">المعلومات الشخصية</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">الاسم الأول</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.firstName ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">اسم العائلة</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.lastName ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] opacity-75 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-[var(--text-secondary)] text-sm mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.phone ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    placeholder="+966 5X XXX XXXX"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">تاريخ الميلاد</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">الجنس</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                  >
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
        </AnimatedItem>

        {/* Professional Information (for therapists) */}
        {user.role === 'therapist' && (
          <AnimatedItem type="slideUp" delay={0.4}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 rounded-2xl shadow-xl border border-[var(--border-color)]/30 mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">المعلومات المهنية</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* License Number */}
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">رقم الترخيص</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                    />
                  </div>

                  {/* Specialty */}
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">التخصص</label>
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                      placeholder="علم النفس السريري، العلاج المعرفي..."
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">سنوات الخبرة</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.yearsOfExperience ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
                  </div>

                  {/* Clinic Address */}
                  <div>
                    <label className="block text-[var(--text-primary)] font-medium mb-2">عنوان العيادة</label>
                    <input
                      type="text"
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                    />
                  </div>
                </div>

                {/* Education */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">المؤهل العلمي</label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                    placeholder="دكتوراه في علم النفس، جامعة..."
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">الشهادات (افصل بينها بفواصل)</label>
                  <input
                    type="text"
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                    placeholder="شهادة العلاج المعرفي السلوكي، شهادة التحليل النفسي..."
                  />
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Action Buttons */}
        <AnimatedItem type="slideUp" delay={0.5}>
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isDirty || saving}
              className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
                !isDirty || saving
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save text-white"></i>
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
