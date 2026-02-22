import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const HomePage = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      if (user.role === 'therapist') {
        navigate('/therapist/dashboard');
      } else {
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, loading, user, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  // Don't render homepage content if authenticated (redirecting)
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedItem type="slideUp" delay={0.1}>
              <div className="text-center lg:text-right">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">منصة وعي</h1>
                <p className="text-xl text-[var(--text-secondary)] mb-2">
                  منصة متخصصة في تحسين الصحة النفسية وتقديم الدعم النفسي
                </p>
                <p className="text-lg text-[var(--text-secondary)] italic mb-8">
                  نسعى إلى بناء مستقبل يكون فيه الاهتمام بالصحة النفسية جزءاً أساسياً من حياة كل فرد
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                  <Link to="/categories" className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-compass text-white"></i> استكشف الأقسام
                  </Link>
                  <Link to="/about" className="px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-lg font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors flex items-center justify-center gap-2">
                    <i className="fas fa-info-circle"></i> اعرف أكثر
                  </Link>
                </div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideLeft" delay={0.2}>
              <div className="relative flex justify-center">
                <div className="relative">
                  <img src="/illustration1.png" alt="منصة وعي" className="w-64 h-64 object-contain" />
                  <div className="absolute inset-0 animate-pulse">
                    <div className="absolute top-10 right-10 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white animate-bounce">
                      <i className="fas fa-heart"></i>
                    </div>
                    <div className="absolute bottom-10 left-10 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse">
                      <i className="fas fa-brain"></i>
                    </div>
                    <div className="absolute top-1/2 left-0 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white animate-ping">
                      <i className="fas fa-hands-helping"></i>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">مهمتنا</h2>
              <p className="text-xl text-[var(--text-secondary)]">نقدم مساحة آمنة لكل شخص يحتاج دعم نفسي</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="space-y-4 text-right">
                <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                  إحنا هنا علشان نكون المساحة الآمنة اللى تساعدك تفهم نفسك، وتسمع صوتك، وتبدأ رحلة التغيير خطوة بخطوة... من غير حكم ولا ضغط.
                </p>
                <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                  نقدم دعماً نفسيًا مبنيًا على العلم والخبرة، ونحترم الخصوصية ونراعي الجانب الإنساني في كل ما نقدمه.
                </p>
              </div>
            </AnimatedItem>
            <AnimatedItem type="slideLeft" delay={0.3}>
              <div className="flex justify-center">
                <img src="/illustration2.png" alt="مهمتنا" className="w-64 h-64 object-contain rounded-lg shadow-lg" />
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">ماذا نقدم؟</h2>
              <p className="text-xl text-[var(--text-secondary)]">مجموعة من الخدمات المتخصصة لدعم صحتك النفسية</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                  <i className="fas fa-comments"></i>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">مجتمع دعم</h3>
                <p className="text-[var(--text-secondary)]">انضم إلى مجتمع من الأفراد الذين يمرون بتجارب مشابهة</p>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                  <i className="fas fa-book-medical"></i>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">محتوى موثوق</h3>
                <p className="text-[var(--text-secondary)]">مقالات وموارد موثوقة في الصحة النفسية</p>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideUp" delay={0.4}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                  <i className="fas fa-robot"></i>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">مساعد ذكي</h3>
                <p className="text-[var(--text-secondary)]">مساعد افتراضي للدعم النفسي الأولي</p>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideUp" delay={0.5}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                  <i className="fas fa-mail-bulk"></i>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">رسالة المستقبل</h3>
                <p className="text-[var(--text-secondary)]">رسالة إلى نفسك في المستقبل لتشجيعك على الاستمرار</p>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">إحصائيات منصتنا</h2>
              <p className="text-xl text-[var(--text-secondary)]">ننمو معًا لتقديم أفضل دعم نفسي ممكن</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedItem type="scale" delay={0.2}>
              <div className="bg-[var(--bg-primary)]/80 backdrop-blur-sm p-8 rounded-xl text-center shadow-md">
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">10K+</div>
                <div className="text-[var(--text-primary)]">مستخدم متفاعل</div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="scale" delay={0.3}>
              <div className="bg-[var(--bg-primary)]/80 backdrop-blur-sm p-8 rounded-xl text-center shadow-md">
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">50+</div>
                <div className="text-[var(--text-primary)]">مختص نفسي</div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="scale" delay={0.4}>
              <div className="bg-[var(--bg-primary)]/80 backdrop-blur-sm p-8 rounded-xl text-center shadow-md">
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">100+</div>
                <div className="text-[var(--text-primary)]">محتوى موثوق</div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="scale" delay={0.5}>
              <div className="bg-[var(--bg-primary)]/80 backdrop-blur-sm p-8 rounded-xl text-center shadow-md">
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">24/7</div>
                <div className="text-[var(--text-primary)]">دعم متاح</div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">ماذا يقول مستخدمو منصة وعي</h2>
              <p className="text-xl text-[var(--text-secondary)]">قصص من أشخاص استفادوا من منصتنا</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-right border border-[var(--border-color)]/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                    SA
                  </div>
                  <div className="text-amber-500">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-[var(--text-primary)] mb-4 italic">"منصة وعي كانت نقطة تحول مهمة في حياتي. وجدت الدعم والتفاهم الذي كنت أبحث عنه."</p>
                <div className="text-[var(--text-primary)] font-medium">سارة أحمد</div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideUp" delay={0.3}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-right border border-[var(--border-color)]/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                    MO
                  </div>
                  <div className="text-amber-500">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
                <p className="text-[var(--text-primary)] mb-4 italic">"تجربة مريحة وآمنة حسيت باهتمام حقيقي ودعم نفسي محترم."</p>
                <div className="text-[var(--text-primary)] font-medium">محمد عمر</div>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideUp" delay={0.4}>
              <div className="bg-[var(--bg-secondary)]/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-right border border-[var(--border-color)]/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold">
                    NR
                  </div>
                  <div className="text-amber-500">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-[var(--text-primary)] mb-4 italic">"الانضمام إلى مجتمع وعي كان له تأثير كبير على تحسين حالتنا النفسية."</p>
                <div className="text-[var(--text-primary)] font-medium">نور ربيع</div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedItem type="slideUp" delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">مستعد لبدء رحلتك نحو الصحة النفسية؟</h2>
            <p className="text-xl text-white opacity-90 mb-10">انضم إلينا اليوم وابدأ رحلتك نحو فهم نفسك وتحسين صحتك النفسية</p>
            <Link to="/categories" className="inline-block px-8 py-4 bg-white text-[var(--primary-color)] rounded-lg font-bold text-lg hover:bg-[var(--bg-primary)] transition-colors">
              <i className="fas fa-sign-in-alt text-[var(--primary-color)] mr-2"></i> <span className="text-[var(--primary-color)]">انضم إلينا الآن</span>
            </Link>
          </AnimatedItem>
        </div>
      </section>
    </div>
  );
};

export default HomePage;