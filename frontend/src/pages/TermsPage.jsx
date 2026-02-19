import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl p-8 border border-[var(--border-color)]/30">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">الشروط والأحكام</h1>
            <p className="text-xl text-[var(--text-secondary)]">الرجاء قراءة هذه الشروط بعناية قبل استخدام المنصة</p>
          </div>

          <div className="prose max-w-none text-right">
            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">مقدمة</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              مرحبًا بك في منصة وعي. هذه الشروط والأحكام تحدد القواعد واللوائح لاستخدام موقع وعي، 
              المتوفر على الإنترنت.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الموافقة على الشروط</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              باستخدام هذا الموقع، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق على أي جزء من هذه الشروط، فلا يجوز لك استخدام منصة وعي.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">التغييرات على الخدمة</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نحتفظ بالحق في إنهاء أو تعديل الخدمة (أو أي جزء منها) في أي وقت ودون إشعار.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">القيود على الاستخدام</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              أنت توافق على عدم استخدام المنصة لأي غرض غير قانوني أو ممنوع بموجب هذه الشروط.
              لا يجوز لك نقل أي حقوق مكتسبة من خلال هذه الشروط دون إذن كتابي منا.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الملكية الفكرية</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              تحتفظ منصة وعي بجميع الحقوق في المحتوى والمواد الأخرى المقدمة على الموقع.
              لا يُسمح بإعادة إنتاج أو توزيع أي محتوى من هذا الموقع دون إذن كتابي.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">المسؤولية القانونية</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              لا تتحمل منصة وعي أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدامك للمنصة.
              المعلومات المقدمة على هذه المنصة تهدف فقط إلى الأغراض التعليمية والدعم النفسي العام.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">التعديلات على الشروط</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة.
              استخدامك المستمر للمنصة بعد إجراء التغييرات يعني قبولك لهذه التغييرات.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الاتصال بنا</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              إذا كانت لديك أي أسئلة حول هذه الشروط، يرجى الاتصال بنا من خلال صفحة الاتصال.
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link to="/signup" className="inline-block px-8 py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-colors">
              العودة للتسجيل
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;