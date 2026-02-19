import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FeedbackPage = () => {
  const [selectedRating, setSelectedRating] = useState(0);
  
  const reviews = [
    {
      id: 1,
      author: 'محمد أحمد',
      avatar: 'MA',
      rating: 5,
      content: 'بجد فرقت معايا جداً وساعدتني أفهم نفسي كويس وأتعامل مع ضغوطاتي. منصة وعي كانت نقطة تحول مهمة في حياتي.',
      date: '15 يناير 2026',
      views: 245,
      comments: 18
    },
    {
      id: 2,
      author: 'سارة محمد',
      avatar: 'SM',
      rating: 4,
      content: 'تجربة مريحة وآمنة حسيت باهتمام حقيقي ودعم نفسي محترم. وجدت فئة كبيرة من الأشخاص المتفهمين.',
      date: '12 يناير 2026',
      views: 189,
      comments: 24
    },
    {
      id: 3,
      author: 'أحمد عادل',
      avatar: 'AC',
      rating: 5,
      content: 'بجد فرقت معايا جداً وساعدتني أفهم نفسي كويس وأتعامل مع ضغوطاتي. الأدوات المتاحة ممتازة.',
      date: '10 يناير 2026',
      views: 312,
      comments: 31
    },
    {
      id: 4,
      author: 'نور ربيع',
      avatar: 'NR',
      rating: 4,
      content: 'تجربة مريحة وآمنة حسيت باهتمام حقيقي ودعم نفسي محترم. المحتوى التعليمي مفيد جدًا.',
      date: '8 يناير 2026',
      views: 276,
      comments: 22
    }
  ];

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">اراء و فيدباك</h1>
          <p className="text-xl text-[var(--text-secondary)]">أعطنا رأيك، واترك لنا فيدباك مميز وبكل صراحة</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">اراء المستخدمين</h2>
            <p className="text-xl text-[var(--text-secondary)]">ما يقوله مستخدمو منصة وعي عن تجربتهم</p>
          </div>
          
          <div className="space-y-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {review.avatar}
                    </div>
                    <div className="text-right">
                      <h4 className="text-xl font-bold text-[var(--text-primary)]">{review.author}</h4>
                      <p className="text-[var(--text-secondary)]">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fas ${i < review.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-6">{review.content}</p>
                </div>
                <div className="flex justify-end gap-8 text-[var(--text-secondary)]">
                  <span className="flex items-center gap-2">
                    <i className="far fa-eye"></i> {review.views}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="far fa-comment"></i> {review.comments}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">اترك لنا أثراً جميلاً</h2>
              <p className="text-[var(--text-secondary)]">شاركنا رأيك وتجربتك مع منصة وعي</p>
            </div>

            <div className="space-y-6">
              <div className="text-right">
                <label htmlFor="feedback-name" className="block text-lg font-medium text-[var(--text-primary)] mb-4">الاسم</label>
                <input
                  type="text"
                  id="feedback-name"
                  placeholder="الاسم"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                />
              </div>

              <div className="text-right">
                <label htmlFor="feedback-email" className="block text-lg font-medium text-[var(--text-primary)] mb-4">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="feedback-email"
                  placeholder="البريد الإلكتروني"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                />
              </div>

              <div className="text-right">
                <label className="block text-lg font-medium text-[var(--text-primary)] mb-4">تقييمك</label>
                <div className="flex justify-end gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`transition-colors ${star <= selectedRating ? 'text-amber-500' : 'text-gray-300'}`}
                      onClick={() => handleStarClick(star)}
                    >
                      <i className={`fas ${star <= selectedRating ? 'fa-star' : 'fa-star'}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <label htmlFor="feedback-content" className="block text-lg font-medium text-[var(--text-primary)] mb-4">التعليق</label>
                <textarea
                  id="feedback-content"
                  placeholder="التعليق"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors resize-vertical text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  rows="5"
                ></textarea>
              </div>

              <div className="text-right">
                <label htmlFor="feedback-category" className="block text-lg font-medium text-[var(--text-primary)] mb-4">الفئة</label>
                <select
                  id="feedback-category"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                >
                  <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اختر فئة التعليق</option>
                  <option value="suggestion" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اقتراحات</option>
                  <option value="complaint" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">شكاوى</option>
                  <option value="praise" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مديح</option>
                  <option value="technical" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مشاكل تقنية</option>
                  <option value="other" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أخرى</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button className="px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-xl font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors">
                  حفظ كمسودة
                </button>
                <button className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
                  <i className="fas fa-paper-plane"></i> إرسال التعليق
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;