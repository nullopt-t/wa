import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">تواصل معنا</h1>
          <p className="text-xl text-[var(--text-secondary)]">نحن هنا للاستماع إليك وتقديم الدعم اللازم</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="text-center lg:text-right">
                <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">معلومات الاتصال</h2>
                <p className="text-lg text-[var(--text-secondary)] mb-8">يمكنك التواصل معنا من خلال الوسائل التالية:</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-[var(--bg-primary)] rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">البريد الإلكتروني</h3>
                    <p className="text-[var(--text-secondary)]">info@waey-mentalhealth.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-[var(--bg-primary)] rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">الهاتف</h3>
                    <p className="text-[var(--text-secondary)]" style={{ direction: 'ltr' }}>+20 2 1234 5678</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-[var(--bg-primary)] rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">الموقع</h3>
                    <p className="text-[var(--text-secondary)]">القاهرة، جمهورية مصر العربية</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-[var(--bg-primary)] rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    <i className="fas fa-headset"></i>
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">خط المساعدة</h3>
                    <p className="text-[var(--text-secondary)]" style={{ direction: 'ltr' }}>16000 (مجاني 24/7)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-6 text-center lg:text-right">أرسل لنا رسالة</h2>

              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[var(--text-primary)] font-medium mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    placeholder="الاسم الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[var(--text-primary)] font-medium mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    placeholder="البريد الإلكتروني"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-[var(--text-primary)] font-medium mb-2">موضوع الرسالة</label>
                  <select
                    id="subject"
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  >
                    <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اختر موضوع الرسالة</option>
                    <option value="support" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">الدعم الفني</option>
                    <option value="feedback" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">ملاحظات واقتراحات</option>
                    <option value="consultation" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">استشارة نفسية</option>
                    <option value="therapist" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">احجز مع معالج</option>
                    <option value="partnership" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">شراكات</option>
                    <option value="general" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">استفسار عام</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[var(--text-primary)] font-medium mb-2">الرسالة</label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[#c5a98e] focus:outline-none transition-colors resize-vertical text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    placeholder="محتوى الرسالة"
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-4 bg-[var(--primary-color)] text-white rounded-lg font-bold text-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2">
                  <i className="fas fa-paper-plane text-white"></i> إرسال الرسالة
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;