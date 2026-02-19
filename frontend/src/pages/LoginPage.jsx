import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
        
        // Save remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        showError(result.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (error) {
      console.error('Login error:', error);
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

              {/* Remember Me & Forgot Password */}
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="flex justify-between items-center text-right">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[var(--accent-amber)] border-2 border-[var(--border-color)] rounded focus:ring-[var(--accent-amber)] focus:ring-offset-0"
                    />
                    <span className="text-[var(--text-primary)]">تذكرني</span>
                  </label>

                  <Link to="/forgot-password" className="text-[var(--accent-amber)] hover:text-[var(--accent-amber)]/80 transition-all duration-300">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </AnimatedItem>

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
