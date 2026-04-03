import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const ForgotPasswordPage = () => {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('يرجى التحقق من البريد الإلكتروني');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      
      // Always show success message for security (prevent email enumeration)
      success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      
      showError(error.message || 'حدث خطأ أثناء إرسال الرابط');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
        <AnimatedItem type="scale" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
                <i className="fas fa-key text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-4">نسيت كلمة المرور؟</h1>
              <p className="text-[var(--text-secondary)]">لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <AnimatedItem type="slideUp" delay={0.2}>
                <div className="text-right">
                  <label htmlFor="email" className="block text-lg font-medium text-[var(--text-primary)] mb-3">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleInputChange}
                      placeholder="أدخل البريد الإلكتروني"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.email ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-envelope"></i>
                    </div>
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1 text-right">{errors.email}</p>}
                </div>
              </AnimatedItem>

              {/* Info Box */}
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">تعليمات:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>أدخل البريد الإلكتروني المرتبط بحسابك</li>
                        <li>تحقق من مجلد البريد الوارد أو المهملات</li>
                        <p>الرابط صالح لمدة ساعة واحدة</p>
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* Submit Button */}
              <AnimatedItem type="slideUp" delay={0.4}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane text-white"></i>
                      إرسال رابط إعادة التعيين
                    </>
                  )}
                </button>
              </AnimatedItem>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[var(--text-secondary)] mb-4">
                تذكرت كلمة المرور؟{' '}
                <Link to="/login" className="text-[var(--accent-amber)] font-medium hover:text-[var(--accent-amber)]/80 transition-colors">
                  تسجيل الدخول
                </Link>
              </p>
              <p className="text-[var(--text-secondary)]">
                ليس لديك حساب؟{' '}
                <Link to="/signup" className="text-[var(--accent-amber)] font-medium hover:text-[var(--accent-amber)]/80 transition-colors">
                  أنشئ حساباً الآن
                </Link>
              </p>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
