import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { therapistsAPI } from '../services/therapistsApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const TherapistDetailPage = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadTherapist();
  }, [id]);

  const loadTherapist = async () => {
    setLoading(true);
    try {
      const data = await therapistsAPI.getById(id);
      setTherapist(data);
    } catch (error) {
      setTherapist(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-user-slash text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">المعالج غير متاح</h2>
          <p className="text-[var(--text-secondary)] mb-6">هذا المعالج غير معتمد أو غير موجود</p>
          <Link to="/find-therapist" className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors">
            العودة للبحث
          </Link>
        </div>
      </div>
    );
  }

  const u = therapist.userId || {};

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] py-16 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {u.avatar ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:4001'}${u.avatar}`}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{u.firstName} {u.lastName}</h1>
              {therapist.specialty && (
                <p className="text-white/90 text-lg">{therapist.specialty}</p>
              )}
              {therapist.isTrusted && (
                <span className="inline-flex items-center gap-1 text-sm bg-white/20 px-3 py-1 rounded-full mt-2">
                  <i className="fas fa-shield-alt"></i> معالج موثوق
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Bio */}
        {therapist.bio && (
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <i className="fas fa-align-right text-[var(--primary-color)]"></i>
                نبذة تعريفية
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{therapist.bio}</p>
            </div>
          </AnimatedItem>
        )}

        {/* Details Grid */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <i className="fas fa-info-circle text-[var(--primary-color)]"></i>
              المعلومات الشخصية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                therapist.city && { icon: 'fa-map-marker-alt', label: 'المدينة', value: therapist.city },
                therapist.country && { icon: 'fa-globe', label: 'البلد', value: therapist.country },
                therapist.clinicAddress && { icon: 'fa-hospital', label: 'العنوان', value: therapist.clinicAddress },
                therapist.experience > 0 && { icon: 'fa-briefcase', label: 'سنوات الخبرة', value: `${therapist.experience} سنة` },
                therapist.languages?.length > 0 && { icon: 'fa-language', label: 'اللغات', value: therapist.languages.join('، ') },
                therapist.licenseNumber && { icon: 'fa-id-card', label: 'رقم الترخيص', value: therapist.licenseNumber },
                u.phone && { icon: 'fa-phone', label: 'الهاتف', value: (() => {
                  const phone = String(u.phone);
                  const code = u.countryCode || '';
                  // Avoid duplicating country code if phone already has it
                  if (code && phone.startsWith(code)) return phone;
                  if (code && phone.startsWith(code.replace('+', ''))) return phone;
                  return code ? `${code} ${phone}` : phone;
                })() },
                u.email && { icon: 'fa-envelope', label: 'البريد الإلكتروني', value: u.email },
              ].filter(Boolean).map((item, i) => (
                <div key={i}>
                  <label className="text-sm text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                    <i className={`fas ${item.icon} text-[var(--primary-color)]`}></i>
                    {item.label}
                  </label>
                  {item.icon === 'fa-phone' ? (
                    <p className="text-[var(--text-primary)] font-medium" style={{ direction: 'ltr', textAlign: 'right' }}>{item.value}</p>
                  ) : (
                    <p className="text-[var(--text-primary)] font-medium">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedItem>

        {/* Back Button */}
        <AnimatedItem type="slideUp" delay={0.3}>
          <Link
            to="/find-therapist"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-primary)] transition-colors border border-[var(--border-color)]"
          >
            <i className="fas fa-arrow-right"></i>
            العودة لنتائج البحث
          </Link>
        </AnimatedItem>
      </div>
    </div>
  );
};

export default TherapistDetailPage;
