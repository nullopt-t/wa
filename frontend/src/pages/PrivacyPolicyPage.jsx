import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl p-8 border border-[var(--border-color)]/30">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">سياسة الخصوصية</h1>
            <p className="text-xl text-[var(--text-secondary)]">كيف نجمع ونستخدم ونحمي معلوماتك</p>
          </div>

          <div className="prose max-w-none text-right">
            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">مقدمة</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              في منصة وعي، نحن ملتزمون بحماية خصوصيتك وحماية معلوماتك الشخصية. 
              توضح سياسة الخصوصية هذه كيفية جمعنا واستخدام وحماية المعلومات التي تقدمها لنا عند استخدامك لمنصتنا.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">المعلومات التي نجمعها</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نجمع المعلومات التالية:
            </p>
            <ul className="mb-6 text-[var(--text-primary)] leading-relaxed list-disc pr-6 space-y-2">
              <li>المعلومات الشخصية مثل الاسم، البريد الإلكتروني، رقم الهاتف، وتاريخ الميلاد</li>
              <li>المعلومات الصحية التي تختار مشاركتها معنا</li>
              <li>المعلومات التقنية مثل نوع الجهاز ونظام التشغيل</li>
              <li>بيانات الاستخدام مثل صفحات الزوار ووقت الزيارة</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">كيف نستخدم معلوماتك</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نستخدم معلوماتك لأغراض محددة:
            </p>
            <ul className="mb-6 text-[var(--text-primary)] leading-relaxed list-disc pr-6 space-y-2">
              <li>توفير خدمات الدعم النفسي والتوجيه</li>
              <li>تخصيص تجربتك على المنصة</li>
              <li>تحسين جودة خدماتنا</li>
              <li>التواصل معك بشأن التحديثات والخدمات</li>
              <li>الامتثال للالتزامات القانونية</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">أمان المعلومات</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو 
              التغيير أو الكشف أو التدمير. نحن نستخدم تقنيات التشفير القياسية لضمان سلامة بياناتك.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">المشاركة مع أطراف ثالثة</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن لا نبيع أو نؤجر أو نتاجر في معلوماتك الشخصية. قد نشارك معلوماتك فقط مع:
            </p>
            <ul className="mb-6 text-[var(--text-primary)] leading-relaxed list-disc pr-6 space-y-2">
              <li>مقدمي الخدمات الذين يعملون نيابة عنا</li>
              <li>الجهات التنظيمية عند الحاجة للامتثال للقوانين</li>
              <li>في حالة الاندماج أو البيع أو إعادة الهيكلة</li>
            </ul>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الوصول إلى معلوماتك</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              يمكنك الوصول إلى معلوماتك الشخصية في أي وقت من خلال حسابك. يمكنك أيضًا طلب تصحيح أو
              حذف معلوماتك عن طريق الاتصال بنا.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">Cookies</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك على المنصة. يمكنك
              اختيار عدم قبول ملفات تعريف الارتباط من خلال إعدادات متصفحك.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الاحتفاظ بالبيانات</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحتفظ بمعلوماتك الشخصية فقط طالما هو ضروري لأغراض جمع البيانات أو الأغراض
              الإضافية الموضحة في سياسة الخصوصية هذه، أو كما يقتضي القانون.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">التحديثات على سياسة الخصوصية</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              نحن نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت. سيتم نشر أي تغييرات
              على هذه الصفحة مع تاريخ السريان.
            </p>

            <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6">الاتصال بنا</h2>
            <p className="mb-6 text-[var(--text-primary)] leading-relaxed">
              إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا من خلال صفحة الاتصال.
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

export default PrivacyPolicyPage;