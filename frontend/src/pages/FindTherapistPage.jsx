import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { therapistsAPI } from '../services/therapistsApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const FindTherapistPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [trustedFilter, setTrustedFilter] = useState('trusted'); // 'trusted' | 'all' | 'pending'
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  const loadTherapists = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedCity) params.set('city', selectedCity);
      if (selectedLanguage) params.set('language', selectedLanguage);
      params.set('trusted', trustedFilter);
      params.set('page', page);
      params.set('limit', limit);

      const data = await therapistsAPI.getAll(params.toString());
      setTherapists(data.therapists || []);
      setTotal(data.total || 0);
    } catch (error) {
      setTherapists([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCity, selectedLanguage, page]);

  useEffect(() => {
    loadTherapists();
  }, [loadTherapists]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadTherapists();
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedLanguage('');
    setTrustedFilter('trusted');
    setPage(1);
  };

  // Collect unique cities from therapists for the dropdown
  const uniqueCities = [...new Set(
    (total > 0 ? therapists : [])
      .map(t => t.city)
      .filter(Boolean)
  )];

  const languages = ['العربية', 'الإنجليزية', 'الفرنسية'];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedItem type="slideUp" delay={0.1}>
            <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">ابحث عن المعالج المناسب</h1>
          </AnimatedItem>
          <AnimatedItem type="slideUp" delay={0.2}>
            <p className="text-xl text-[var(--text-secondary)]">تصفح ملفات المعالجين المعتمدين واختر الأنسب لاحتياجاتك</p>
          </AnimatedItem>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.3}>
            <form onSubmit={handleSearch} className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو التخصص أو المدينة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <i className="fas fa-search"></i>
                  </div>
                </div>

                {/* City */}
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-primary)] bg-[var(--bg-primary)]"
                >
                  <option value="">كل المدن</option>
                  {uniqueCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                {/* Language */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => { setSelectedLanguage(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-primary)] bg-[var(--bg-primary)]"
                >
                  <option value="">كل اللغات</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Trusted Filter */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <select
                  value={trustedFilter}
                  onChange={(e) => { setTrustedFilter(e.target.value); setPage(1); }}
                  className="px-4 py-2.5 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none text-[var(--text-primary)] bg-[var(--bg-primary)] text-sm"
                >
                  <option value="trusted">الموثوقين فقط</option>
                  <option value="all">الكل</option>
                  <option value="pending">قيد المراجعة</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4 justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl font-semibold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-search"></i> بحث
                </button>
                {(searchTerm || selectedCity || selectedLanguage) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    إعادة تعيين
                  </button>
                )}
              </div>
            </form>
          </AnimatedItem>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {loading ? 'جاري التحميل...' : `${total} معالج${total === 1 ? '' : ''}`}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : therapists.length === 0 ? (
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                <i className="fas fa-user-md text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا يوجد معالجين</h3>
                <p className="text-[var(--text-secondary)]">حاول تغيير معايير البحث</p>
              </div>
            </AnimatedItem>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {therapists.map((therapist, index) => (
                <AnimatedItem key={therapist._id || therapist.userId?._id} type="slideUp" delay={index * 0.05}>
                  <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all overflow-hidden flex flex-col">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-5 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                          {therapist.userId?.avatar ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}${therapist.userId.avatar}`}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            `${therapist.userId?.firstName?.charAt(0) || ''}${therapist.userId?.lastName?.charAt(0) || ''}`
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate">
                            {therapist.userId?.firstName} {therapist.userId?.lastName}
                          </h3>
                          {therapist.isTrusted && (
                            <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1">
                              <i className="fas fa-shield-alt"></i> موثوق
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col">
                      {therapist.specialty && (
                        <p className="text-[var(--primary-color)] font-medium text-sm mb-2">{therapist.specialty}</p>
                      )}

                      {therapist.bio && (
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4 leading-relaxed">{therapist.bio}</p>
                      )}

                      {/* Info Grid */}
                      <div className="space-y-2 text-sm text-[var(--text-secondary)] mt-auto">
                        {therapist.city && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-map-marker-alt text-[var(--primary-color)] w-4"></i>
                            <span>{therapist.city}{therapist.country ? `، ${therapist.country}` : ''}</span>
                          </div>
                        )}
                        {therapist.experience > 0 && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-briefcase text-[var(--primary-color)] w-4"></i>
                            <span>{therapist.experience} سنوات خبرة</span>
                          </div>
                        )}
                        {therapist.languages && therapist.languages.length > 0 && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-language text-[var(--primary-color)] w-4"></i>
                            <span>{therapist.languages.join('، ')}</span>
                          </div>
                        )}
                        {therapist.clinicAddress && (
                          <div className="flex items-start gap-2">
                            <i className="fas fa-hospital text-[var(--primary-color)] w-4 mt-1"></i>
                            <span className="line-clamp-2">{therapist.clinicAddress}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <Link
                        to={`/therapists/${therapist.userId?._id}`}
                        className="mt-4 w-full px-4 py-2.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-xl font-medium text-center hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                      >
                        <i className="fas fa-user ml-2"></i>عرض الملف الشخصي
                      </Link>
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                    p === page
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                disabled={page >= Math.ceil(total / limit)}
                className="px-4 py-2 rounded-xl border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">كيفية استخدام خدمة البحث عن المعالجين</h2>
              <p className="text-xl text-[var(--text-secondary)]">خطوات بسيطة للوصول إلى الدعم النفسي المناسب</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-search', title: 'ابحث عن المعالج', desc: 'استخدم أدوات البحث لتحديد التخصص والمدينة واللغة' },
              { icon: 'fa-user-md', title: 'قارن الخيارات', desc: 'اطلع على ملفات المعالجين وقراءة النبذات التعريفية' },
              { icon: 'fa-phone', title: 'تواصل مباشرة', desc: 'استخدم معلومات التواصل المتاحة لبدء رحلتك نحو الصحة النفسية' },
            ].map((step, i) => (
              <AnimatedItem key={i} type="slideUp" delay={0.2 + i * 0.1}>
                <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{step.title}</h3>
                  <p className="text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FindTherapistPage;
