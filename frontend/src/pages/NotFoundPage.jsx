import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Navigate when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      // Try to go back, if can't go back then go to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  }, [countdown, navigate]);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center p-4">
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="text-center max-w-2xl">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-full mb-6">
              <i className="fas fa-search text-white text-5xl"></i>
            </div>
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl font-bold text-[var(--primary-color)] mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            الصفحة غير موجودة
          </h2>
          
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
          </p>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              to="/"
              className="p-4 bg-[var(--card-bg)] backdrop-blur-md rounded-xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--primary-color)]/20 rounded-lg flex items-center justify-center group-hover:bg-[var(--primary-color)]/30 transition-colors">
                  <i className="fas fa-home text-[var(--primary-color)]"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--text-primary)]">الرئيسية</div>
                  <div className="text-sm text-[var(--text-secondary)]">العودة للصفحة الرئيسية</div>
                </div>
              </div>
            </Link>

            <Link
              to="/categories"
              className="p-4 bg-[var(--card-bg)] backdrop-blur-md rounded-xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--primary-color)]/20 rounded-lg flex items-center justify-center group-hover:bg-[var(--primary-color)]/30 transition-colors">
                  <i className="fas fa-compass text-[var(--primary-color)]"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--text-primary)]">الأقسام</div>
                  <div className="text-sm text-[var(--text-secondary)]">تصفح الأقسام</div>
                </div>
              </div>
            </Link>

            <Link
              to="/contact"
              className="p-4 bg-[var(--card-bg)] backdrop-blur-md rounded-xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--primary-color)]/20 rounded-lg flex items-center justify-center group-hover:bg-[var(--primary-color)]/30 transition-colors">
                  <i className="fas fa-envelope text-[var(--primary-color)]"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--text-primary)]">تواصل معنا</div>
                  <div className="text-sm text-[var(--text-secondary)]">أرسل لنا رسالة</div>
                </div>
              </div>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="p-4 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <i className="fas fa-arrow-right text-white"></i>
                </div>
                <div className="text-right">
                  <div className="font-bold">رجوع</div>
                  <div className="text-sm text-white/80">العودة للصفحة السابقة</div>
                </div>
              </div>
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <p className="text-[var(--text-secondary)] mb-4">
              هل تعتقد أن هذه مشكلة تقنية؟
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              <i className="fas fa-headset"></i>
              تواصل مع الدعم الفني
            </Link>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-secondary)] mt-8">
            <i className="fas fa-clock"></i>
            <span>العودة للصفحة السابقة خلال </span>
            <span className={`font-bold text-lg transition-all duration-300 ${
              countdown <= 3 ? 'text-red-500 animate-pulse' : 'text-[var(--primary-color)]'
            }`}>
              {countdown}
            </span>
            <span> ثوانٍ</span>
          </div>

          {/* Cancel Auto-Redirect */}
          <button
            onClick={() => setCountdown(999)}
            className="mt-4 text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium transition-colors"
          >
            <i className="fas fa-pause ml-1"></i>
            إيقاف التحويل التلقائي
          </button>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default NotFoundPage;
