import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const CategoriesPage = () => {
  const categories = [
    {
      id: 1,
      title: 'رحلة وعي',
      description: 'مسارك نحو التطور والنمو النفسي',
      icon: 'fas fa-route',
      path: '#'
    },
    {
      id: 2,
      title: 'مجتمع وعي',
      description: 'انضم إلى مجتمع الدعم والمشاركة',
      icon: 'fas fa-users',
      path: '/community'
    },
    {
      id: 3,
      title: 'مقالات وعي',
      description: 'مقالات موثوقة في الصحة النفسية',
      icon: 'fas fa-newspaper',
      path: '/articles'
    },
    {
      id: 4,
      title: 'وعي للإدمان',
      description: 'دعم متخصص للتعافي من الإدمان',
      icon: 'fas fa-heartbeat',
      path: '#'
    },
    {
      id: 5,
      title: 'رسالة وعي المستقبلية',
      description: 'رسالتك إلى نفسك في المستقبل',
      icon: 'fas fa-envelope-open-text',
      path: '/future-message'
    },
    {
      id: 6,
      title: 'مساعد وعي الذكي',
      description: 'مساعد افتراضي للدعم النفسي',
      icon: 'fas fa-robot',
      path: '/chatbot'
    },
    {
      id: 7,
      title: 'دليل وعي',
      description: 'أدلة عملية لتحسين صحتك النفسية',
      icon: 'fas fa-book',
      path: '#'
    },
    {
      id: 8,
      title: 'كتب',
      description: 'مجموعة من الكتب المتخصصة في الصحة النفسية',
      icon: 'fas fa-book-open',
      path: '#'
    },
    {
      id: 8,
      title: 'فيديوهات',
      description: 'فيديوهات تعليمية وتحفيزية',
      icon: 'fas fa-video',
      path: '/videos'
    },
    {
      id: 9,
      title: 'مقالات',
      description: 'مقالات موثوقة في الصحة النفسية',
      icon: 'fas fa-newspaper',
      path: '#'
    },
    {
      id: 10,
      title: 'قصص وتجارب',
      description: 'قصص واقعية من أشخاص مروا بتجارب مشابهة',
      icon: 'fas fa-comment-dots',
      path: '/stories'
    },
    {
      id: 11,
      title: 'اراء و فيدباك',
      description: 'انضم إلى مجتمع الدعم والمشاركة',
      icon: 'fas fa-comments',
      path: '/feedback'
    },
    {
      id: 12,
      title: 'ابحث عن المعالج',
      description: 'ابحث واتصل بأفضل المعالجين النفسيين',
      icon: 'fas fa-search',
      path: '/find-therapist'
    }
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedItem type="slideUp" delay={0.1}>
            <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">استكشف أقسام منصة وعي</h1>
            <p className="text-xl text-[var(--text-secondary)]">نقدم لك مجموعة متنوعة من الأقسام المتخصصة لدعم صحتك النفسية</p>
          </AnimatedItem>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">الأقسام المتاحة</h2>
              <p className="text-xl text-[var(--text-secondary)]">اختر القسم الذي يناسب احتياجاتك النفسية والصحية</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <AnimatedItem key={category.id} type="slideUp" delay={0.1 * index}>
                <Link
                  to={category.path}
                  className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)] hover:shadow-xl transition-shadow duration-300 block h-full"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                    <i className={category.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{category.title}</h3>
                  <p className="text-[var(--text-secondary)]">{category.description}</p>
                </Link>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;