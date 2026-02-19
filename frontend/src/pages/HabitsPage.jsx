import React from 'react';
import { Link } from 'react-router-dom';

const HabitsPage = () => {
  const samplePosts = [
    {
      id: 1,
      author: 'محمد أحمد',
      time: 'اليوم 12:30 PM',
      avatar: 'MA',
      content: 'اليوم استطعت أن أكمل التمرين الصباحي الذي كنت أؤجله منذ أسبوعين، شعرت بسعادة كبيرة وطاقة إيجابية طوال اليوم.'
    },
    {
      id: 2,
      author: 'سارة محمد',
      time: 'أمس 09:15 PM',
      avatar: 'SM',
      content: 'استطعت اليوم أن أتجنب التفكير السلبي لمدة 6 ساعات متواصلة، بدأت أشعر أنني أتحكم في نفسي أكثر من ذي قبل.'
    },
    {
      id: 3,
      author: 'أحمد عادل',
      time: 'أمس 07:45 AM',
      avatar: 'AC',
      content: 'كنت أخاف من مواجهة مشاكل العمل، لكنني اليوم تحدثت مع مديري ووجدت أنه متفهم أكثر مما كنت أتخيل.'
    }
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">مشاركة عادات/إنجازات يومية</h1>
          <p className="text-xl text-[var(--text-secondary)]">شاركنا يومك وعاداتك وإنجازاتك، احكي لنا عن كل لحظة مهمة</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">مشاركات الأعضاء</h2>
            <p className="text-xl text-[var(--text-secondary)]">انضم إلى مجتمعنا وشارك تجاربك ونجاحاتك</p>
          </div>
          
          <div className="space-y-8">
            {samplePosts.map(post => (
              <div key={post.id} className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {post.avatar}
                  </div>
                  <div className="text-right">
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">{post.author}</h4>
                    <p className="text-[var(--text-secondary)]">{post.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-primary)] text-lg leading-relaxed">{post.content}</p>
                </div>
                <div className="flex justify-end gap-6 mt-6 pt-6 border-t border-[var(--border-color)]">
                  <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                    <i className="far fa-heart"></i> 12
                  </button>
                  <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-500 transition-colors">
                    <i className="far fa-comment"></i> 5
                  </button>
                  <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-green-500 transition-colors">
                    <i className="far fa-share-square"></i> مشاركة
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">شاركنا تجربتك</h2>
              <p className="text-[var(--text-secondary)]">اكتب عن عاداتك أو إنجازاتك اليومية</p>
            </div>

            <div className="space-y-6">
              <div className="text-right">
                <label htmlFor="habit-post" className="block text-lg font-medium text-[var(--text-primary)] mb-4">مشاركة جديدة</label>
                <textarea
                  id="habit-post"
                  placeholder="اليوم/العادات/الإنجازات"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors resize-none text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  rows="6"
                ></textarea>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <i className="fas fa-image"></i> صورة
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <i className="fas fa-smile"></i> تعبير
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <i className="fas fa-calendar-day"></i> تاريخ
                  </button>
                </div>

                <button className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-lg font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
                  <i className="fas fa-paper-plane"></i> نشر
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HabitsPage;