import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FindTherapistPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [location, setLocation] = useState('');

  // Sample therapist data
  const therapists = [
    {
      id: 1,
      name: 'د. سارة أحمد',
      specialty: 'علاج اضطرابات القلق والاكتئاب',
      rating: 4.9,
      reviews: 128,
      languages: ['العربية', 'الإنجليزية'],
      availability: 'متاح غدًا',
      profileImage: '/therapist1.jpg',
      bio: 'أخصائية في علاج الاضطرابات النفسية مع أكثر من 10 سنوات من الخبرة',
      price: '150 ريال/جلسة'
    },
    {
      id: 2,
      name: 'أ. محمد علي',
      specialty: 'العلاج السلوكي المعرفي',
      rating: 4.8,
      reviews: 96,
      languages: ['العربية'],
      availability: 'متاح اليوم',
      profileImage: '/therapist2.jpg',
      bio: 'متخصص في العلاج السلوكي المعرفي وتقنيات التعامل مع الضغوط',
      price: '120 ريال/جلسة'
    },
    {
      id: 3,
      name: 'د. نور اليمامة',
      specialty: 'الإدمان والتعافي',
      rating: 4.95,
      reviews: 210,
      languages: ['العربية', 'الفرنسية'],
      availability: 'متاح بعد 2 أيام',
      profileImage: '/therapist3.jpg',
      bio: 'متخصصة في علاج الإدمان وتقديم الدعم النفسي للمرضى وعائلاتهم',
      price: '200 ريال/جلسة'
    },
    {
      id: 4,
      name: 'أ. ريم عبدالله',
      specialty: 'الصحة النفسية للأطفال والمراهقين',
      rating: 4.7,
      reviews: 87,
      languages: ['العربية', 'الإنجليزية'],
      availability: 'متاح هذا الأسبوع',
      profileImage: '/therapist4.jpg',
      bio: 'أخصائية في الصحة النفسية للأطفال والمراهقين مع خبرة في اضطرابات التعلم',
      price: '180 ريال/جلسة'
    }
  ];

  const specialties = [
    'جميع التخصصات',
    'القلق والاكتئاب',
    'الإدمان',
    'العلاقات الزوجية',
    'الصحة النفسية للأطفال',
    'العلاج السلوكي المعرفي',
    'الصدمات النفسية'
  ];

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'جميع التخصصات' || 
                            therapist.specialty.includes(selectedSpecialty);
    const matchesLocation = location === '' || therapist.availability.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">ابحث عن المعالج المناسب</h1>
          <p className="text-xl text-[var(--text-secondary)]">ابحث واتصل بأفضل المعالجين النفسيين في منطقتك</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-[var(--bg-primary)] p-6 sm:p-8 rounded-2xl shadow-lg border border-[var(--border-color)] mb-12">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="search" className="block text-lg font-medium text-[var(--text-primary)] mb-2">البحث عن المعالج</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="ابحث عن اسم المعالج أو تخصصه..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 pr-12 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]">
                    <i className="fas fa-search"></i>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="specialty" className="block text-lg font-medium text-[var(--text-primary)] mb-2">التخصص</label>
                  <select
                    id="specialty"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  >
                    {specialties.map((specialty, index) => (
                      <option key={index} value={specialty} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-lg font-medium text-[var(--text-primary)] mb-2">الموقع</label>
                  <input
                    type="text"
                    id="location"
                    placeholder="المدينة أو المنطقة"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-[var(--primary-color)] text-white rounded-xl font-bold text-base sm:text-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
                <i className="fas fa-search text-white"></i> ابدأ البحث
              </button>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">المعالجون المتاحون</h2>
            <p className="text-xl text-[var(--text-secondary)]">اختر المعالج الأنسب لاحتياجاتك</p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredTherapists.map(therapist => (
              <div key={therapist.id} className="bg-[var(--bg-primary)] p-6 sm:p-8 rounded-2xl shadow-lg border border-[var(--border-color)] hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-center text-center sm:text-right">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        {therapist.profileImage ? (
                          <img src={therapist.profileImage} alt={therapist.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{therapist.name.split(' ').map(n => n[0]).join('')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-start justify-between gap-4 mb-3">
                        <div className="text-center sm:text-right">
                          <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{therapist.name}</h3>
                          <p className="text-[var(--primary-color)] font-medium">{therapist.specialty}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-4 py-2 rounded-lg justify-center">
                          <div className="text-amber-500 flex">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < Math.floor(therapist.rating) ? 'text-amber-500' : 'text-gray-300'}`}></i>
                            ))}
                          </div>
                          <span className="text-[var(--text-primary)] font-medium">{therapist.rating}</span>
                          <span className="text-[var(--text-secondary)]">({therapist.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-right">
                    <p className="text-[var(--text-secondary)] mb-4">{therapist.bio}</p>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 justify-center sm:justify-end">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <i className="fas fa-globe text-[var(--primary-color)]"></i>
                        <span className="text-[var(--text-primary)]">{therapist.languages.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <i className="fas fa-calendar-check text-[var(--primary-color)]"></i>
                        <span className="text-[var(--text-primary)]">{therapist.availability}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <i className="fas fa-money-bill-wave text-[var(--primary-color)]"></i>
                        <span className="text-[var(--text-primary)]">{therapist.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link 
                        to={`/book-appointment/${therapist.id}`} 
                        className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-calendar-check"></i> حجز موعد
                      </Link>
                      
                      <Link 
                        to={`/therapist-profile/${therapist.id}`} 
                        className="px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-lg font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-user"></i> عرض الملف
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">كيفية استخدام خدمة البحث عن المعالجين</h2>
            <p className="text-xl text-[var(--text-secondary)]">خطوات بسيطة للوصول إلى الدعم النفسي المناسب</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">ابحث عن المعالج</h3>
              <p className="text-[var(--text-secondary)]">استخدم أدوات البحث المتقدمة لتحديد التخصص والمكان واللغة</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-user-md"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">قارن الخيارات</h3>
              <p className="text-[var(--text-secondary)]">اطلع على ملفات المعالجين وقراءة التقييمات والأسعار</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">احجز جلستك</h3>
              <p className="text-[var(--text-secondary)]">حدد الموعد الأنسب لك وابدأ رحلتك نحو الصحة النفسية</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindTherapistPage;