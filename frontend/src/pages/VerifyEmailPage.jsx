import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { authAPI } from '../api.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const VerifyEmailPage = () => {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  // Get user type from navigation state (from signup)
  const userType = location.state?.userType || 'user';
  const email = location.state?.email || '';

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState(email);

  useEffect(() => {
    if (token) {
      // Verify email with token from URL
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    setVerifying(true);
    try {
      const result = await authAPI.verifyEmail(verificationToken);
      setVerified(true);
      success(result.message || 'تم التحقق من بريدك الإلكتروني بنجاح!');

      // Redirect based on user type
      setTimeout(() => {
        if (userType === 'therapist') {
          // Therapists need admin approval before they can log in
          navigate('/verify-email/pending-approval', { state: { email: email || location.state?.email } });
        } else {
          // Regular users can go to dashboard
          navigate('/dashboard');
        }
      }, 3000);
    } catch (error) {
      console.error('Verification error:', error);
      showError(error.message || 'فشل التحقق من البريد الإلكتروني');
      setVerifying(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!resendEmail) {
      showError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    setResending(true);
    try {
      await authAPI.resendVerificationEmail({ email: resendEmail });
      success('تم إرسال رابط التحقق إلى بريدك الإلكتروني');
      setResendEmail('');
    } catch (error) {
      console.error('Resend error:', error);
      showError(error.message || 'حدث خطأ أثناء إرسال رابط التحقق');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
        <AnimatedItem type="scale" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
            {token ? (
              // Verification in progress or completed
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6 mx-auto">
                  {verifying ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                  ) : verified ? (
                    <i className="fas fa-check-circle text-white text-4xl"></i>
                  ) : (
                    <i className="fas fa-times-circle text-white text-4xl"></i>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                  {verifying ? 'جاري التحقق...' : verified ? 'تم التحقق بنجاح! 🎉' : 'فشل التحقق'}
                </h1>

                <p className="text-[var(--text-secondary)] mb-8">
                  {verifying 
                    ? 'جاري التحقق من بريدك الإلكتروني، يرجى الانتظار...'
                    : verified
                    ? 'تم التحقق من بريدك الإلكتروني بنجاح! جاري تحويلك إلى لوحة التحكم...'
                    : 'رابط التحقق غير صالح أو منتهي الصلاحية'
                  }
                </p>

                {verified && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      <i className="fas fa-info-circle ml-2"></i>
                      يمكنك الآن الوصول إلى جميع ميزات المنصة
                    </p>
                  </div>
                )}

                {!verifying && !verified && (
                  <div className="space-y-4">
                    <Link
                      to="/forgot-password"
                      className="block w-full py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-all duration-300"
                    >
                      <i className="fas fa-key ml-2"></i>
                      طلب رابط جديد
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold text-lg hover:bg-[var(--bg-secondary)] transition-all duration-300"
                    >
                      <i className="fas fa-sign-in-alt ml-2"></i>
                      تسجيل الدخول
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              // No token - show resend form
              <div>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
                    <i className="fas fa-envelope text-white text-2xl"></i>
                  </div>
                  <h1 className="text-3xl font-bold text-[var(--primary-color)] mb-4">التحقق من البريد الإلكتروني</h1>
                  <p className="text-[var(--text-secondary)]">أدخل بريدك الإلكتروني لإعادة إرسال رابط التحقق</p>
                </div>

                <form className="space-y-6" onSubmit={handleResendVerification}>
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
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="أدخل البريد الإلكتروني"
                          className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-all duration-300 text-[var(--text-primary)] bg-[var(--bg-secondary)]"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                          <i className="fas fa-envelope"></i>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem type="slideUp" delay={0.3}>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">تعليمات:</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>أدخل البريد الإلكتروني المسجل به حسابك</li>
                            <li>تحقق من مجلد البريد الوارد أو المهملات</li>
                            <li>الرابط صالح لمدة 24 ساعة</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AnimatedItem>

                  <AnimatedItem type="slideUp" delay={0.4}>
                    <button
                      type="submit"
                      disabled={resending || !resendEmail}
                      className={`w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                        resending || !resendEmail ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {resending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane text-white"></i>
                          إرسال رابط التحقق
                        </>
                      )}
                    </button>
                  </AnimatedItem>
                </form>

                <div className="mt-8 text-center space-y-4">
                  <p className="text-[var(--text-secondary)]">
                    لديك حساب بالفعل؟{' '}
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
            )}
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
