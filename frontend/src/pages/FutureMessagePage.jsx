import React from 'react';
import { Link } from 'react-router-dom';

const FutureMessagePage = () => {
  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">رسالة وعي المستقبلية</h1>
          <p className="text-xl text-[var(--text-secondary)]">اكتب رسالتك إلى نفسك في المستقبل وسنرسلها لك في الوقت المناسب</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">اكتب رسالتك إلى المستقبل</h2>
            <p className="text-xl text-[var(--text-secondary)]">سجّل رسالتك واهدافك التي تود تذكير نفسك بها في المستقبل</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
              <div className="space-y-6">
                <div className="text-right">
                  <label htmlFor="message-title" className="block text-lg font-medium text-[var(--text-primary)] mb-4">عنوان الرسالة</label>
                  <input
                    type="text"
                    id="message-title"
                    placeholder="عنوان الرسالة"
                    className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                </div>

                <div className="text-right">
                  <label htmlFor="message-content" className="block text-lg font-medium text-[var(--text-primary)] mb-4">محتوى الرسالة</label>
                  <textarea
                    id="message-content"
                    placeholder="محتوى الرسالة"
                    className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors resize-vertical text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    rows="6"
                  ></textarea>
                </div>

                <div className="text-right">
                  <label className="block text-lg font-medium text-[var(--text-primary)] mb-4">اختر وقت التذكير</label>
                  <div className="grid grid-cols-3 gap-4">
                    <select className="px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]">
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">2027</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">2028</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">2029</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">2030</option>
                    </select>

                    <select className="px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]">
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">يناير</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">فبراير</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مارس</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أبريل</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مايو</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">يونيو</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">يوليو</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أغسطس</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">سبتمبر</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أكتوبر</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">نوفمبر</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">ديسمبر</option>
                    </select>

                    <select className="px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]">
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">1</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">2</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">3</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">4</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">5</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">6</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">7</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">8</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">9</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">10</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">11</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">12</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">13</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">14</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">15</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">16</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">17</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">18</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">19</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">20</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">21</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">22</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">23</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">24</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">25</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">26</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">27</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">28</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">29</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">30</option>
                      <option className="bg-[var(--bg-primary)] text-[var(--text-primary)]">31</option>
                    </select>
                  </div>
                </div>

                <div className="text-right">
                  <label className="block text-lg font-medium text-[var(--text-primary)] mb-4">أضف تذكير</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-[var(--accent-amber)] border-2 border-[var(--border-color)] rounded focus:ring-[var(--accent-amber)] focus:ring-offset-0" />
                      <span className="text-[var(--text-primary)]">تذكير قبل 1 أسبوع</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-[var(--accent-amber)] border-2 border-[var(--border-color)] rounded focus:ring-[var(--accent-amber)] focus:ring-offset-0" />
                      <span className="text-[var(--text-primary)]">تذكير قبل 1 شهر</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-[var(--accent-amber)] border-2 border-[var(--border-color)] rounded focus:ring-[var(--accent-amber)] focus:ring-offset-0" />
                      <span className="text-[var(--text-primary)]">تذكير قبل 3 أشهر</span>
                    </label>
                  </div>
                </div>

                <button className="w-full py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2">
                  <i className="fas fa-paper-plane"></i> إرسال الرسالة
                </button>
              </div>
            </div>
            
            <div className="flex justify-center items-start">
              <div className="relative">
                <img src="/illustration1.png" alt="Illustration" className="w-80 h-80 object-contain rounded-lg shadow-lg" />
                <div className="absolute inset-0">
                  <div className="absolute top-10 right-10 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white animate-bounce">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="absolute bottom-10 left-10 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div className="absolute top-1/2 left-0 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white animate-ping">
                    <i className="fas fa-star"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">كيف تعمل خدمة رسالة وعي المستقبلية</h2>
            <p className="text-xl text-[var(--text-secondary)]">خطوات بسيطة لإرسال رسالتك إلى نفسك في المستقبل</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-edit"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">اكتب رسالتك</h3>
              <p className="text-[var(--text-secondary)]">اكتب الرسالة التي تود إرسالها إلى نفسك في المستقبل</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">اختر الوقت</h3>
              <p className="text-[var(--text-secondary)]">حدد التاريخ المناسب لتلقي رسالتك في المستقبل</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-paper-plane"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">أرسل الرسالة</h3>
              <p className="text-[var(--text-secondary)]">سنحتفظ برسالتك ونرسلها لك في الوقت الذي حددته</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-bell"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">استلم الرسالة</h3>
              <p className="text-[var(--text-secondary)]">سنرسل لك الرسالة في الوقت الذي حددته</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">مستعد لكتابة رسالتك إلى نفسك في المستقبل؟</h2>
          <p className="text-xl mb-10 opacity-90">ابدأ رحلتك نحو التحفيز الذاتي والتذكير بأهدافك</p>
          <Link to="/categories" className="inline-block px-8 py-4 bg-white text-[var(--primary-color)] rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
            <i className="fas fa-edit ml-2"></i> ابدأ كتابة رسالتك
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FutureMessagePage;