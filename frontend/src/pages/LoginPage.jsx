import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const LoginPage = () => {
  const { login, user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  // Immediate redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect based on user role after login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-focus on email field and prevent browser validation styling
  useEffect(() => {
    emailRef.current?.focus();

    // Disable autofill yellow background and fix input colors
    const style = document.createElement('style');
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-text-fill-color: var(--text-primary) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
      input:-webkit-autofill {
        box-shadow: 0 0 0px 1000px var(--bg-secondary) inset !important;
      }
      input:invalid,
      input:user-invalid {
        background-color: var(--bg-secondary) !important;
      }
      input[type="email"],
      input[type="password"] {
        background-color: var(--bg-secondary) !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف';
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
      const result = await login(formData.email, formData.password);

      if (result.success) {
        success('تم تسجيل الدخول بنجاح!');
        // Redirect handled by useEffect
      } else {
        showError(result.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Check if it's an email not verified error
      if (error.message && error.message.includes('لم يتم التحقق')) {
        setShowResendVerification(true);
      }

      // Check if it's a therapist pending approval error
      if (error.message && error.message.includes('قيد المراجعة')) {
        // Navigate to pending approval page with email
        setTimeout(() => {
          navigate('/verify-email/pending-approval', { state: { email: formData.email } });
        }, 2000);
      }

      showError(error.message || 'حدث خطأ أثناء تسجيل الدخول');
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl mb-4">
                <i className="fas fa-sign-in-alt text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-4">مرحباً بعودتك!</h1>
              <p className="text-[var(--text-secondary)]">الرجاء إدخال بياناتك لتسجيل الدخول</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <AnimatedItem type="slideUp" delay={0.2}>
                <div className="text-right">
                  <label htmlFor="email" className="block text-lg font-medium text-[var(--text-primary)] mb-3">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      ref={emailRef}
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
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

              {/* Password */}
              <AnimatedItem type="slideUp" delay={0.3}>
                <div className="text-right">
                  <label htmlFor="password" className="block text-lg font-medium text-[var(--text-primary)] mb-3">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="أدخل كلمة المرور"
                      className={`w-full px-6 py-4 pr-12 border-2 rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)] ${errors.password ? 'border-red-500' : 'border-[var(--border-color)]'}`}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                      <i className="fas fa-lock"></i>
                    </div>
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-amber)] transition-all duration-300"
                      onClick={togglePasswordVisibility}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1 text-right">{errors.password}</p>}
                </div>
              </AnimatedItem>

              {/* Forgot Password Link */}
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="flex justify-end text-right">
                  <Link to="/forgot-password" className="text-[var(--accent-amber)] hover:text-[var(--accent-amber)]/80 transition-all duration-300">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </AnimatedItem>

              {/* Resend Verification (shown when email not verified) */}
              {showResendVerification && (
                <AnimatedItem type="slideUp" delay={0.45}>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-exclamation-triangle text-amber-500 text-xl mt-0.5"></i>
                      <div className="flex-1">
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                          لم يتم التحقق من بريدك الإلكتروني
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                          يرجى التحقق من بريدك الإلكتروني أو طلب رابط تحقق جديد
                        </p>
                        <div className="flex gap-2">
                          <Link
                            to="/verify-email"
                            className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors text-center"
                            onClick={() => setShowResendVerification(false)}
                          >
                            <i className="fas fa-envelope ml-1"></i>
                            التحقق الآن
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                await authAPI.resendVerificationEmail({ email: formData.email });
                                success('تم إرسال رابط التحقق إلى بريدك الإلكتروني');
                                setShowResendVerification(false);
                              } catch (error) {
                                showError(error.message || 'حدث خطأ أثناء إرسال رابط التحقق');
                              }
                            }}
                            className="flex-1 py-2 border-2 border-amber-500 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                          >
                            <i className="fas fa-redo ml-1"></i>
                            إعادة الإرسال
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              )}

              {/* Submit Button */}
              <AnimatedItem type="slideUp" delay={0.5}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt text-white"></i>
                      تسجيل الدخول
                    </>
                  )}
                </button>
              </AnimatedItem>
            </form>

            <div className="mt-8 text-center">
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

export default LoginPage;
