import React from 'react';
import { Link } from 'react-router-dom';

const VisionPage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">رؤية وعي</h1>
          <p className="text-xl text-[var(--text-secondary)]">ن стремиться إلى بناء مستقبل يكون فيه الاهتمام بالصحة النفسية جزءاً أساسياً من حياة كل فرد</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4 text-right">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">الصحة النفسية جزء أساسي من حية كل فرد</h2>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                ننظر إلى الاضطرابات النفسية والإدمان باعتبارها أمراضاً قابلة للفهم والعلاج، وليس وصمة أو ضعفاً. نؤمن أن التغيير يبدأ بالوعي، وأن كل خطوة نحو الفهم هي الخطوة نحو التعافي.
              </p>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نسعى إلى أن تكون وعي منصة رائدة في التوعية والعلاج النفسي، تساهم في نشر المعرفة الصحيحة، وتقديم خدمات نفسية آمنة، سهلة الوصول، ومدعومة بأسس علمية حديثة.
              </p>
            </div>
            <div className="flex justify-center">
              <img src="/ai-illustration.jpg" alt="طبيب نفسي" className="w-80 h-80 object-contain rounded-lg shadow-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img src="/illustration1.png" alt="رؤية المستقبل" className="w-80 h-80 object-contain rounded-lg shadow-lg" />
            </div>
            <div className="space-y-4 text-right">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">رؤيتنا للمستقبل</h2>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نسعى إلى بناء مستقبل يكون فيه الاهتمام بالصحة النفسية جزءاً أساسياً من حياة كل فرد. ننظر إلى الاضطرابات النفسية والإدمان باعتبارها أمراضاً قابلة للفهم والعلاج، وليس وصمة أو ضعفاً.
              </p>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نطمح إلى أن تكون وعي منصة رائدة في التوعية والعلاج النفسي، تساهم في نشر المعرفة الصحيحة، وتقديم خدمات نفسية آمنة، سهلة الوصول، ومدعومة بأسس علمية حديثة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">أهدافنا المستقبلية</h2>
            <p className="text-xl text-[var(--text-secondary)]">نعمل بجد لتحقيق هذه الأهداف لخدمة المجتمع</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">نشر الوعي بالصحة النفسية</h3>
              <p className="text-[var(--text-secondary)]">نعمل على زيادة الوعي بأهمية الصحة النفسية في جميع مراحل الحياة</p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-user-friends"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">تقليل وصمة الأمراض النفسية</h3>
              <p className="text-[var(--text-secondary)]">نعمل على تقليل وصمة الأمراض النفسية والإدمان في المجتمع</p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-clinic-medical"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">إتاحة خدمات نفسية موثوقة</h3>
              <p className="text-[var(--text-secondary)]">نعمل على توفير خدمات نفسية موثوقة وسهلة الوصول</p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">دعم التعافي والاستقرار النفسي</h3>
              <p className="text-[var(--text-secondary)]">نقدم الدعم اللازم للتعافي والاستقرار النفسي على المدى الطويل</p>
            </div>
            
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">تمكين الأفراد من مواجهة ضغوط الحياة</h3>
              <p className="text-[var(--text-secondary)]">نعمل على تمكين الأفراد من مواجهة ضغوط الحياة بطرق صحية</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-right">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">إلتزامتنا</h2>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نلتزم بتقديم محتوى وخدمات تحترم الخصوصية، تراعي الجانب الإنساني، وتعتمد على العلم والخبرة، لنكون دائماً مساحة آمنة لكل من يبحث عن الدعم والمساعدة.
              </p>
              <p className="text-[var(--text-primary)] text-lg leading-relaxed">
                نؤمن أن التغيير يبدأ بالوعي، وأن كل خطوة نحو الفهم هي الخطوة نحو التعافي. نعمل بجد لتقديم تجربة متكاملة تلبي احتياجات الأفراد في مختلف مراحل حياتهم.
              </p>
            </div>
            <div className="flex justify-center">
              <img src="/illustration2.png" alt="الالتزام" className="w-80 h-80 object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">رسالة أمل</h2>
          <p className="text-xl mb-10 opacity-90">نؤمن أن التغيير يبدأ بالوعي، وأن كل خطوة نحو الفهم هي الخطوة نحو التعافي</p>
          <p className="text-xl mb-10 opacity-90">لا تتردد في طلب المساعدة، فهذا يدل على القوة وليس الضعف. نحن نؤمن بأن每个人都 deserves فرصة للشفاء والنمو.</p>
          <Link to="/categories" className="inline-block px-8 py-4 bg-white text-[var(--primary-color)] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
            <i className="fas fa-compass ml-2"></i> استكشف الأقسام
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VisionPage;