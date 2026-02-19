import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">عن منصة وعي</h1>
          <p className="text-xl text-[var(--text-secondary)]">منصة متخصصة في تحسين الصحة النفسية وتقديم الدعم النفسي</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-right">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">من نحن؟</h2>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                إحنا هنا علشان نكون المساحة الآمنة اللى تساعدك تفهم نفسك، وتسمع صوتك، وتبدأ رحلة التغيير خطوة بخطوة... من غير حكم ولا ضغط.
              </p>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                منصة وعي هي منصة مختصة في تحسين الصحة النفسية وتقديم الدعم النفسي للأفراد. نسعى إلى بناء مستقبل يكون فيه الاهتمام بالصحة النفسية جزءاً أساسياً من حية كل فرد.
              </p>
            </div>
            <div className="flex justify-center">
              <img src="/about-illustration.png" alt="منصة وعي" className="w-80 h-80 object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">مهمتنا ورؤيتنا</h2>
            <p className="text-xl text-[var(--text-secondary)]">نعمل بجد لتحقيق أهدافنا في دعم الصحة النفسية</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-crosshairs"></i>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">مهمتنا</h3>
              </div>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نقدم مساحة آمنة لكل شخص يحتاج دعم نفسي، نساعدك تفهم نفسك، وتتعامل مع ضغوطاتك، وتحس بتحسين تدريجي في حالتك النفسية. نحترم خصوصيتك ونراعي الجانب الإنساني في كل ما نقدمه.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-2xl">
                  <i className="fas fa-eye"></i>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">رؤيتنا</h3>
              </div>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نسعى إلى بناء مستقبل يكون فيه الاهتمام بالصحة النفسية جزءاً أساسياً من حياة كل فرد. ننظر إلى الاضطرابات النفسية والإدمان باعتبارها أمراضاً قابلة للفهم والعلاج، ونطمح إلى أن تكون وعي منصة رائدة في التوعية والعلاج النفسي.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">قيمنا الأساسية</h2>
            <p className="text-xl text-[var(--text-secondary)]">نلتزم بتقديم محتوى وخدمات عالية الجودة</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[var(--bg-primary)] p-8 rounded-xl text-center shadow-md">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">الخصوصية والأمان</h3>
              <p className="text-[var(--text-secondary)]">نحترم خصوصيتك ونوفر بيئة آمنة لجميع المستخدمين</p>
            </div>

            <div className="bg-[var(--bg-primary)] p-8 rounded-xl text-center shadow-md">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-heart"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">التعاطف والدعم</h3>
              <p className="text-[var(--text-secondary)]">نقدم دعماً إنسانياً مبنياً على التعاطف والتفاهم</p>
            </div>

            <div className="bg-[var(--bg-primary)] p-8 rounded-xl text-center shadow-md">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-book-medical"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">العلم والخبرة</h3>
              <p className="text-[var(--text-secondary)]">نعتمد على المعرفة العلمية الحديثة في تقديم خدماتنا</p>
            </div>

            <div className="bg-[var(--bg-primary)] p-8 rounded-xl text-center shadow-md">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-hands-helping"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--primary-color)] mb-4">الشمولية</h3>
              <p className="text-[var(--text-secondary)]">نؤمن أن الرعاية النفسية يجب أن تكون متاحة للجميع</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">نؤمن أن التغيير يبدأ بالوعي</h2>
          <p className="text-xl text-white mb-10 opacity-90">وأن كل خطوة نحو الفهم هي الخطوة نحو التعافي</p>
          <Link to="/categories" className="inline-block px-8 py-4 bg-white text-[var(--primary-color)] rounded-lg font-bold text-lg hover:bg-[var(--bg-primary)] transition-colors">
            <i className="fas fa-compass text-[var(--primary-color)] ml-2"></i> <span className="text-[var(--primary-color)]">استكشف الأقسام</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;