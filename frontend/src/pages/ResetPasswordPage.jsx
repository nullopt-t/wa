import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const ResetPasswordPage = () => {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!token) {
      showError('رابط إعادة التعيين غير صحيح أو مفقود');
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [token, navigate, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Calculate password strength
    if (name === 'newPassword') {
      let strength = 0;
      if (value.length >= 6) strength++;
      if (value.length >= 10) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;
      if (/[^a-zA-Z0-9]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'يرجى تأكيد كلمة المرور';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'كلمتا المرور غير متطابقتين';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('يرجى التحقق من البيانات المدخلة');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });

      success('تم إعادة تعيين كلمة المرور بنجاح!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      
      showError(error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
        <AnimatedItem type="scale" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
                <i className="fas fa-lock-open text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-4">إعادة تعيين كلمة المرور</h1>
              <p className="text-[var(--text-secondary)]">أدخل كلمة المرور الجديدة لحسابك</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* New Password */}
              <AnimatedItem type="slideUp" delay={0.2}>
                <div className="text-right">
                  <label htmlFor="newPassword" className="block text-lg font-medium text-[var(--text-primary)] mb-3">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="أدخل كلمة المرور الجديدة"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.newPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-all duration-300"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      <i className={`fas ${showPassword.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1 text-right">{errors.newPassword}</p>}
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              passwordStrength >= level
                                ? level <= 2 ? 'bg-red-500' : level === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        قوة كلمة المرور: {
                          passwordStrength < 2 ? 'ضعيفة جداً' :
                          passwordStrength < 3 ? 'ضعيفة' :
                          passwordStrength < 4 ? 'متوسطة' :
                          passwordStrength < 5 ? 'جيدة' : 'قوية جداً'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedItem>

              {/* Confirm Password */}
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="text-right">
                  <label htmlFor="confirmNewPassword" className="block text-lg font-medium text-[var(--text-primary)] mb-3">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      placeholder="أكد كلمة المرور الجديدة"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.confirmNewPassword ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-all duration-300"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      <i className={`fas ${showPassword.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1 text-right">{errors.confirmNewPassword}</p>}
                </div>
              </AnimatedItem>

              {/* Password Requirements */}
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-shield-alt text-amber-500 text-xl mt-0.5"></i>
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-2">شروط كلمة المرور:</p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          <i className={`fas ${formData.newPassword?.length >= 6 ? 'fa-check text-green-500' : 'fa-times text-amber-500'}`}></i>
                          6 أحرف على الأقل
                        </li>
                        <li className="flex items-center gap-2">
                          <i className={`fas ${/[A-Z]/.test(formData.newPassword || '') ? 'fa-check text-green-500' : 'fa-times text-amber-500'}`}></i>
                          حرف كبير واحد على الأقل
                        </li>
                        <li className="flex items-center gap-2">
                          <i className={`fas ${/\d/.test(formData.newPassword || '') ? 'fa-check text-green-500' : 'fa-times text-amber-500'}`}></i>
                          رقم واحد على الأقل
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* Submit Button */}
              <AnimatedItem type="slideUp" delay={0.5}>
                <button
                  type="submit"
                  disabled={loading || !formData.newPassword || !formData.confirmNewPassword}
                  className={`w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                    loading || !formData.newPassword || !formData.confirmNewPassword
                      ? 'opacity-75 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      جاري إعادة التعيين...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle text-white"></i>
                      إعادة تعيين كلمة المرور
                    </>
                  )}
                </button>
              </AnimatedItem>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[var(--text-secondary)]">
                تذكرت كلمة المرور؟{' '}
                <Link to="/login" className="text-[var(--accent-amber)] font-medium hover:text-[var(--accent-amber)]/80 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
