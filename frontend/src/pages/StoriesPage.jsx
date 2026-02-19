import React from 'react';
import { Link } from 'react-router-dom';

const StoriesPage = () => {
  const stories = [
    {
      id: 1,
      author: 'علي فوزي',
      avatar: 'CF',
      date: '15 يناير 2026',
      content: 'أنا كنت فاكر إن الرجولة يعني أكتم... كنت شايف إن الوجع لو ماطلعش بيطلع في شكل تاني. لكنني تعلمت أن مشاركة المشاعر ليست ضعفًا، بل قوة حقيقية.',
      views: 245,
      comments: 18,
      likes: 42
    },
    {
      id: 2,
      author: 'هشام مصطفى',
      avatar: 'HM',
      date: '12 يناير 2026',
      content: 'العلاقة دي علمتني أخاف قبل ما أتكلم وأحسب كل كلمة.. طلعت بدرس مهم: عمري ما أجي على نفسي عشان حد. تعلمت أن أضع حدودًا لعلاقتي مع الآخرين.',
      views: 189,
      comments: 24,
      likes: 36
    },
    {
      id: 3,
      author: 'أحمد المتولي',
      avatar: 'AM',
      date: '10 يناير 2026',
      content: 'الاكتئاب مش دايماً دموع.. أصعب خطوة كانت إني أقول: أنا محتاج دكتور. العلاج مش ضعف، هو خطوة الشفاء والتعافي.',
      views: 312,
      comments: 31,
      likes: 58
    },
    {
      id: 4,
      author: 'إسلام فؤاد',
      avatar: 'EF',
      date: '8 يناير 2026',
      content: 'أصعب يوم في التعافي مش أول يوم.. لكن فخور إني مكمل. كل يوم أختار أن أعيش، هو انتصار جديد على الأفكار السلبية.',
      views: 276,
      comments: 22,
      likes: 47
    },
    {
      id: 5,
      author: 'نورا علي',
      avatar: 'NA',
      date: '5 يناير 2026',
      content: 'أصعب يوم في التعافي مش أول يوم.. لكن فخور إني مكمل. تعلمت أن أحب نفسي حتى في أسوأ الأوقات.',
      views: 198,
      comments: 15,
      likes: 33
    }
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">قصص وتجارب</h1>
          <p className="text-xl text-[var(--text-secondary)]">احكي رحلتك وتجاربك، فكل قصة لك لها قيمة وتلهم الآخرين</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">قصص من أشخاص مروا بتجارب مشابهة</h2>
            <p className="text-xl text-[var(--text-secondary)]">قصص واقعية من أشخاص تغلبوا على تحديات نفسية</p>
          </div>
          
          <div className="space-y-8">
            {stories.map(story => (
              <div key={story.id} className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {story.avatar}
                  </div>
                  <div className="text-right">
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">{story.author}</h4>
                    <p className="text-[var(--text-secondary)]">{story.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-6">{story.content}</p>
                </div>
                <div className="flex justify-end gap-8 text-[var(--text-secondary)]">
                  <span className="flex items-center gap-2">
                    <i className="far fa-eye"></i> {story.views}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="far fa-comment"></i> {story.comments}
                  </span>
                  <span className="flex items-center gap-2">
                    <i className="far fa-heart"></i> {story.likes}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">شارك قصتك</h2>
              <p className="text-[var(--text-secondary)]">قصتك قد تكون سببًا في شفاء شخص آخر</p>
            </div>

            <div className="space-y-6">
              <div className="text-right">
                <label htmlFor="story-title" className="block text-lg font-medium text-[var(--text-primary)] mb-4">عنوان القصة</label>
                <input
                  type="text"
                  id="story-title"
                  placeholder="عنوان القصة"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                />
              </div>

              <div className="text-right">
                <label htmlFor="story-content" className="block text-lg font-medium text-[var(--text-primary)] mb-4">محتوى القصة</label>
                <textarea
                  id="story-content"
                  placeholder="محتوى القصة"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors resize-none text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  rows="8"
                ></textarea>
              </div>

              <div className="text-right">
                <label htmlFor="story-category" className="block text-lg font-medium text-[var(--text-primary)] mb-4">فئة القصة</label>
                <select
                  id="story-category"
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                >
                  <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اختر فئة القصة</option>
                  <option value="depression" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">الاكتئاب</option>
                  <option value="anxiety" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">القلق</option>
                  <option value="addiction" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">الإدمان</option>
                  <option value="relationships" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">العلاقات</option>
                  <option value="recovery" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">التعافي</option>
                  <option value="other" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أخرى</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button className="px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-xl font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors">
                  حفظ كمسودة
                </button>
                <button className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
                  <i className="fas fa-paper-plane"></i> مشاركة القصة
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoriesPage;