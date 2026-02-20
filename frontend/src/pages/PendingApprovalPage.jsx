import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const PendingApprovalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'بريدك الإلكتروني';

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto p-4 sm:p-6">
        <AnimatedItem type="scale" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-[var(--border-color)]/30">
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 mx-auto">
                <i className="fas fa-hourglass-half text-white text-4xl animate-pulse"></i>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--primary-color)] mb-4">
                حسابك قيد المراجعة
              </h1>

              {/* Message */}
              <p className="text-[var(--text-secondary)] mb-6 text-sm sm:text-base">
                شكراً لتسجيلك كمعالج في منصة وعي. تم التحقق من بريدك الإلكتروني بنجاح، وطلبك الآن قيد المراجعة من قبل فريقنا.
              </p>

              {/* Info Box */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-right">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-amber-500 text-xl mt-0.5"></i>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    <p className="font-medium mb-2">ماذا يحدث الآن؟</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <p>سيقوم فريق المراجعة بفحص بياناتك وشهاداتك المهنية</p>
                      <p>ستستغرق عملية المراجعة من ٢٤ إلى ٤٨ ساعة عمل</p>
                      <p>ستتلقى بريداً إلكترونياً عند الموافقة على حسابك</p>
                      <p>يمكنك تسجيل الدخول بعد الموافقة مباشرة</p>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Email Display */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 mb-6">
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  <i className="fas fa-envelope ml-2"></i>
                  البريد الإلكتروني المسجل:
                </p>
                <p className="text-[var(--text-primary)] font-medium text-sm break-all">
                  {email}
                </p>
              </div>

              {/* Contact Support */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <i className="fas fa-headset ml-2"></i>
                  لديك استفسار؟{' '}
                  <Link to="/contact" className="font-medium underline hover:text-blue-600 dark:hover:text-blue-400">
                    تواصل مع فريق الدعم
                  </Link>
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-all duration-300"
                >
                  <i className="fas fa-sign-in-alt ml-2"></i>
                  الذهاب لتسجيل الدخول
                </Link>
                <button
                  onClick={() => navigate('/')}
                  className="block w-full py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold text-lg hover:bg-[var(--bg-secondary)] transition-all duration-300"
                >
                  <i className="fas fa-home ml-2"></i>
                  العودة للرئيسية
                </button>
              </div>
            </div>
          </div>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
