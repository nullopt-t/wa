import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { booksAPI } from '../services/communityApi.js';

const WaeyAddictionPage = () => {
  const [addictionBooks, setAddictionBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const loadAddictionBooks = async () => {
      try {
        setLoadingBooks(true);
        // Search for addiction-related books using multiple search terms
        const searchTerms = ['إدمان', 'addiction', 'تعافي', 'recovery', 'علاج', 'تأهيل'];
        const allBooks = new Map();

        // Fetch books for each search term
        for (const term of searchTerms) {
          try {
            const data = await booksAPI.getAll({ search: term, limit: 20 });
            const booksArray = Array.isArray(data) ? data : (data?.books || []);
            
            booksArray.forEach(book => {
              if (!allBooks.has(book._id)) {
                allBooks.set(book._id, book);
              }
            });
          } catch (err) {
            console.error(`Error searching for "${term}":`, err);
          }
        }

        setAddictionBooks(Array.from(allBooks.values()).slice(0, 5));
      } catch (error) {
        console.error('Error loading addiction-related books:', error);
        setAddictionBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    loadAddictionBooks();
  }, []);

  const pillars = [
    {
      id: 1,
      icon: 'fas fa-brain',
      title: 'أسباب الإدمان',
      description: 'التركيز على العوامل النفسية، المحفزات العاطفية، والبيئة الاجتماعية',
      color: 'from-teal-500 to-blue-500',
      bgLight: 'bg-teal-50 dark:bg-teal-950/20',
      steps: [
        {
          number: '١',
          title: 'العوامل النفسية',
          description: 'الضغوط النفسية، القلق، والاكتئاب قد تدفع الشخص للبحث عن مخرج سريع',
          icon: 'fas fa-head-side-virus'
        },
        {
          number: '٢',
          title: 'المحفزات العاطفية',
          description: 'المشاعر السلبية مثل الوحدة، الحزن، أو الشعور بالفراغ الداخلي',
          icon: 'fas fa-heart-crack'
        },
        {
          number: '٣',
          title: 'البيئة الاجتماعية',
          description: 'تأثير الأصدقاء، البيئة المحيطة، والضغوط الاجتماعية',
          icon: 'fas fa-users'
        },
        {
          number: '٤',
          title: 'العوامل الوراثية',
          description: 'الاستعداد الوراثي الذي قد يزيد من احتمالية الإدمان',
          icon: 'fas fa-dna'
        },
        {
          number: '٥',
          title: 'تجارب الطفولة',
          description: 'الصدمات المبكرة والإهمال في الطفولة تؤثر على السلوك المستقبلي',
          icon: 'fas fa-child'
        }
      ]
    },
    {
      id: 2,
      icon: 'fas fa-exclamation-triangle',
      title: 'أعراض الإدمان',
      description: 'التعرف على التغييرات السلوكية، فقدان السيطرة، والعزلة الاجتماعية',
      color: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50 dark:bg-blue-950/20',
      steps: [
        {
          number: '١',
          title: 'التغييرات السلوكية',
          description: 'تغير مفاجئ في السلوك، الانسحاب من الأنشطة المعتادة',
          icon: 'fas fa-exchange-alt'
        },
        {
          number: '٢',
          title: 'فقدان السيطرة',
          description: 'عدم القدرة على التوقف أو التحكم في كمية الاستهلاك',
          icon: 'fas fa-hand-paper'
        },
        {
          number: '٣',
          title: 'العزلة الاجتماعية',
          description: 'الابتعاد عن العائلة والأصدقاء وتفضيل الانعزال',
          icon: 'fas fa-user-slash'
        },
        {
          number: '٤',
          title: 'تغييرات المزاج',
          description: 'تقلبات مزاجية حادة، الغضب السريع، والتهيج',
          icon: 'fas fa-theater-masks'
        },
        {
          number: '٥',
          title: 'إهمال المسؤوليات',
          description: 'التقصير في العمل، الدراسة، أو الالتزامات الشخصية',
          icon: 'fas fa-tasks'
        }
      ]
    },
    {
      id: 3,
      icon: 'fas fa-hand-holding-medical',
      title: 'طرق العلاج',
      description: 'العلاج السلوكي، برامج التأهيل، ودعم الأسرة',
      color: 'from-teal-400 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      steps: [
        {
          number: '١',
          title: 'العلاج السلوكي المعرفي',
          description: 'تعديل الأفكار السلبية وتطوير استراتيجيات مواجهة صحية',
          icon: 'fas fa-comments'
        },
        {
          number: '٢',
          title: 'برامج التأهيل',
          description: 'برامج علاجية مكثفة في مراكز متخصصة تحت إشراف أطباء',
          icon: 'fas fa-hospital'
        },
        {
          number: '٣',
          title: 'الدعم الأسري',
          description: 'إشراك الأسرة في عملية العلاج وتوفير بيئة داعمة',
          icon: 'fas fa-home'
        },
        {
          number: '٤',
          title: 'العلاج الدوائي',
          description: 'أدوية مساعدة تحت إشراف طبي للتخفيف من أعراض الانسحاب',
          icon: 'fas fa-pills'
        },
        {
          number: '٥',
          title: 'مجموعات الدعم',
          description: 'الانضمام لمجموعات الدعم المتبادل لمشاركة التجارب',
          icon: 'fas fa-people-carry'
        }
      ]
    },
    {
      id: 4,
      icon: 'fas fa-shield-alt',
      title: 'الوقاية من الانتكاس',
      description: 'استراتيجيات ضبط النفس، تجنب المحفزات، والدعم المستمر',
      color: 'from-indigo-400 to-blue-500',
      bgLight: 'bg-indigo-50 dark:bg-indigo-950/20',
      steps: [
        {
          number: '١',
          title: 'تحديد المحفزات',
          description: 'التعرف على المواقف والأشخاص والمشاعر التي تثير الرغبة',
          icon: 'fas fa-eye'
        },
        {
          number: '٢',
          title: 'تطوير استراتيجيات المواجهة',
          description: 'تعلم تقنيات التنفس، التأمل، والأنشطة البديلة الصحية',
          icon: 'fas fa-spa'
        },
        {
          number: '٣',
          title: 'بناء شبكة دعم',
          description: 'تطوير علاقات صحية مع أشخاص يدعمون التعافي',
          icon: 'fas fa-handshake'
        },
        {
          number: '٤',
          title: 'الرعاية الذاتية',
          description: 'ممارسة الرياضة، التغذية السليمة، والنوم الكافي',
          icon: 'fas fa-running'
        },
        {
          number: '٥',
          title: 'المتابعة المستمرة',
          description: 'زيارات منتظمة للمعالج والحضور المستمر لمجموعات الدعم',
          icon: 'fas fa-calendar-check'
        }
      ]
    }
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-50 via-blue-50 to-white dark:from-teal-950/30 dark:via-blue-950/30 dark:to-[var(--bg-primary)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedItem type="slideRight" delay={0.2}>
              <div className="text-right">
                <h1 className="text-5xl font-bold text-[var(--primary-color)] mb-6 leading-tight">
                  وعي للإدمان
                </h1>
                <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
                  توعية علمية وآمنة للعلاج. نقدم محتوى تعليمي وخدمات علاجية للمساعدة في فهم الإدمان وأسبابه النفسية والجسدية وطرق العلاج الآمنة مع خصوصية تامة ومصداقية علمية.
                </p>
              </div>
            </AnimatedItem>

            <AnimatedItem type="slideLeft" delay={0.3}>
              <div className="relative">
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  {/* Brain Illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Brain Icon Container */}
                      <div className="w-64 h-64 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-2xl">
                        <i className="fas fa-brain text-9xl text-white"></i>
                      </div>
                      
                      {/* Orbiting Elements */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-teal-200 dark:bg-teal-800 flex items-center justify-center animate-pulse">
                        <i className="fas fa-heart text-2xl text-teal-600 dark:text-teal-300"></i>
                      </div>
                      <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>
                        <i className="fas fa-shield-alt text-xl text-blue-600 dark:text-blue-300"></i>
                      </div>
                      <div className="absolute top-1/2 -right-8 w-12 h-12 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>
                        <i className="fas fa-user-shield text-lg text-indigo-600 dark:text-indigo-300"></i>
                      </div>
                    </div>
                  </div>
                  
                  {/* Background Decorations */}
                  <div className="absolute top-10 left-10 w-20 h-20 bg-teal-200/30 dark:bg-teal-700/20 rounded-full blur-xl"></div>
                  <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-200/30 dark:bg-blue-700/20 rounded-full blur-xl"></div>
                </div>
              </div>
            </AnimatedItem>
          </div>
        </div>
      </section>

      {/* Detailed Pillar Sections */}
      {pillars.map((pillar, pillarIndex) => (
        <section key={pillar.id} className={`py-20 ${pillarIndex % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-primary)]'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <AnimatedItem type="slideUp" delay={0.1}>
              <div className="text-center mb-16">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${pillar.color} text-white text-3xl mb-6 shadow-xl`}>
                  <i className={pillar.icon}></i>
                </div>
                <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-4">
                  {pillar.title}
                </h2>
                <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
                  {pillar.description}
                </p>
              </div>
            </AnimatedItem>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {pillar.steps.map((step, index) => (
                <AnimatedItem key={index} type="slideUp" delay={0.1 * index}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group relative bg-[var(--bg-primary)] rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-[var(--primary-color)]/40 transition-all duration-300 h-full overflow-hidden"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    {/* Step Number Badge */}
                    <div className="relative mb-4">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${pillar.color} text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {step.number}
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${pillar.bgLight} flex items-center justify-center group-hover:scale-125 transition-transform duration-300`}>
                        <i className={`${step.icon} text-sm text-[var(--primary-color)]`}></i>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--primary-color)] transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {step.description}
                    </p>

                    {/* Decorative Corner */}
                    <div className="absolute bottom-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                      <div className={`w-full h-full bg-gradient-to-br ${pillar.color} rounded-tr-full`}></div>
                    </div>
                  </motion.div>
                </AnimatedItem>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Recommended Resources */}
      <section className="py-20 bg-gradient-to-br from-teal-50 via-blue-50 to-white dark:from-teal-950/20 dark:via-blue-950/20 dark:to-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--primary-color)] mb-4">
                كتب مقترحة للعلاج والوقاية من الانتكاس
              </h2>
              <p className="text-xl text-[var(--text-secondary)]">
                مجموعة مختارة من الكتب المتخصصة في علم نفس الإدمان والتعافي
              </p>
            </div>
          </AnimatedItem>

          {loadingBooks ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
            </div>
          ) : addictionBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {addictionBooks.map((book, index) => (
                <AnimatedItem key={book._id} type="scale" delay={0.1 * index}>
                  <Link
                    to={`/books/${book.slug || book._id}`}
                    className="bg-[var(--bg-secondary)] rounded-xl p-6 shadow-lg border border-[var(--border-color)] hover:border-[var(--primary-color)]/50 transition-all duration-300 hover:shadow-xl hover:scale-105 text-center group cursor-pointer block"
                  >
                    {/* Book Cover */}
                    <div className="relative w-full aspect-[3/4] mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/50 dark:to-blue-900/50 flex items-center justify-center group-hover:from-teal-200 group-hover:to-blue-200 dark:group-hover:from-teal-800/50 dark:group-hover:to-blue-800/50 transition-all duration-300">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fas fa-book text-5xl text-[var(--primary-color)]"></i>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {book.author}
                    </p>
                  </Link>
                </AnimatedItem>
              ))}
            </div>
          ) : (
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center border border-[var(--border-color)]">
                <i className="fas fa-book-open text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  لا توجد كتب متاحة حالياً
                </h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  تابعنا للحصول على كتب جديدة قريباً
                </p>
                <Link
                  to="/books"
                  className="inline-block bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  تصفح جميع الكتب
                  <i className="fas fa-arrow-left mr-2"></i>
                </Link>
              </div>
            </AnimatedItem>
          )}
        </div>
      </section>
    </div>
  );
};

export default WaeyAddictionPage;
