import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { futureMessagesAPI } from '../services/communityApi.js';

const CreateFutureMessagePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { error: showError, success } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    deliverAfter: '1',
    deliverUnit: 'hours', // minutes, hours, days, weeks, months, years
    isEmailNotification: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getUnitLabel = (unit) => {
    const labels = { minutes: 'دقائق', hours: 'ساعات', days: 'أيام', weeks: 'أسابيع', months: 'أشهر', years: 'سنوات' };
    return labels[unit] || '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    } else if (formData.title.length > 500) {
      newErrors.title = 'العنوان يجب أن يكون 500 حرف كحد أقصى';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة';
    } else if (formData.message.length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
    } else if (formData.message.length > 5000) {
      newErrors.message = 'الرسالة يجب أن تكون 5000 حرف كحد أقصى';
    }

    if (!formData.deliverAfter || Number(formData.deliverAfter) < 1) {
      newErrors.deliverAfter = 'يجب إدخال مدة صحيحة';
    } else {
      const amount = Number(formData.deliverAfter);
      const now = new Date();
      const deliverDate = new Date(now);

      switch (formData.deliverUnit) {
        case 'minutes': deliverDate.setMinutes(deliverDate.getMinutes() + amount); break;
        case 'hours': deliverDate.setHours(deliverDate.getHours() + amount); break;
        case 'days': deliverDate.setDate(deliverDate.getDate() + amount); break;
        case 'weeks': deliverDate.setDate(deliverDate.getDate() + amount * 7); break;
        case 'months': deliverDate.setMonth(deliverDate.getMonth() + amount); break;
        case 'years': deliverDate.setFullYear(deliverDate.getFullYear() + amount); break;
      }

      const minDate = new Date(now.getTime() + 60000); // 1 min from now
      const maxDate = new Date(now);
      maxDate.setFullYear(maxDate.getFullYear() + 10);

      if (deliverDate < minDate) {
        newErrors.deliverAfter = 'يجب أن يكون موعد التسليم بعد دقيقة واحدة على الأقل';
      } else if (deliverDate > maxDate) {
        newErrors.deliverAfter = 'لا يمكن جدولة رسائل لأكثر من 10 سنوات في المستقبل';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data - don't send recipientEmail if not enabled
      const now = new Date();
      const amount = Number(formData.deliverAfter);
      const deliverAt = new Date(now);

      switch (formData.deliverUnit) {
        case 'minutes': deliverAt.setMinutes(deliverAt.getMinutes() + amount); break;
        case 'hours': deliverAt.setHours(deliverAt.getHours() + amount); break;
        case 'days': deliverAt.setDate(deliverAt.getDate() + amount); break;
        case 'weeks': deliverAt.setDate(deliverAt.getDate() + amount * 7); break;
        case 'months': deliverAt.setMonth(deliverAt.getMonth() + amount); break;
        case 'years': deliverAt.setFullYear(deliverAt.getFullYear() + amount); break;
      }

      const submitData = {
        title: formData.title,
        message: formData.message,
        deliverAt: deliverAt.toISOString(),
        isEmailNotification: formData.isEmailNotification,
      };

      await futureMessagesAPI.create(submitData);
      success('تم جدولة رسالتك بنجاح! سيتم تسليمها في الوقت المحدد');
      navigate('/future-messages');
    } catch (error) {
      showError(error.message || 'فشل جدولة الرسالة');
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum date/time (1 minute from now) - using local time
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const minDate = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  const minTime = String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              رسالة إلى مستقبلي
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              اكتب رسالة لنفسك في المستقبل وسيقوم النظام بتسليمها في الوقت المحدد
            </p>
          </div>
        </AnimatedItem>

        {/* Form */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-8 border border-[var(--border-color)]/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                  عنوان الرسالة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="مثال: نصيحة لنفسي بعد سنة..."
                  className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                    errors.title ? 'border-red-500' : 'border-[var(--border-color)]'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                  محتوى الرسالة <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="اكتب رسالتك إلى نفسك في المستقبل..."
                  rows="10"
                  className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors ${
                    errors.message ? 'border-red-500' : 'border-[var(--border-color)]'
                  }`}
                />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                  <span>50-5000 حرف</span>
                  <span className={formData.message.length > 5000 ? 'text-red-500' : ''}>
                    {formData.message.length} حرف
                  </span>
                </div>
              </div>

              {/* Deliver After */}
              <div>
                <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
                  موعد التسليم <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="deliverAfter"
                      value={formData.deliverAfter}
                      onChange={handleInputChange}
                      min="1"
                      max="120"
                      className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors ${
                        errors.deliverAfter ? 'border-red-500' : 'border-[var(--border-color)]'
                      }`}
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <select
                      name="deliverUnit"
                      value={formData.deliverUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors appearance-none ${
                        errors.deliverAfter ? 'border-red-500' : 'border-[var(--border-color)]'
                      }`}
                    >
                      <option value="minutes">دقائق</option>
                      <option value="hours">ساعات</option>
                      <option value="days">أيام</option>
                      <option value="weeks">أسابيع</option>
                      <option value="months">أشهر</option>
                      <option value="years">سنوات</option>
                    </select>
                  </div>
                </div>
                {errors.deliverAfter && <p className="text-red-500 text-sm mt-1">{errors.deliverAfter}</p>}
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  ستُسلَّم رسالتك بعد {formData.deliverAfter} {getUnitLabel(formData.deliverUnit)} من الآن
                </p>
              </div>

              {/* Email Notification */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isEmailNotification"
                    checked={formData.isEmailNotification}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-[var(--text-primary)] font-medium">
                    إرسال إشعار عبر البريد الإلكتروني عند التسليم
                  </span>
                </label>
                <p className="text-xs text-[var(--text-secondary)] mt-2 ml-8">
                  سيتم الإرسال إلى بريدك الإلكتروني المسجل
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      جاري الجدولة...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      جدولة الرسالة
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/future-messages')}
                  className="px-8 py-4 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors text-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </AnimatedItem>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--border-color)]/30 text-center">
              <i className="fas fa-lock text-4xl text-[var(--primary-color)] mb-3"></i>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">خاصة وآمنة</h3>
              <p className="text-sm text-[var(--text-secondary)]">رسالتك مشفرة ولا يراها أحد غيرك</p>
            </div>
          </AnimatedItem>

          <AnimatedItem type="slideUp" delay={0.4}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--border-color)]/30 text-center">
              <i className="fas fa-clock text-4xl text-[var(--primary-color)] mb-3"></i>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">تسليم في الوقت المحدد</h3>
              <p className="text-sm text-[var(--text-secondary)]">سيتم تسليم رسالتك بالضبط في الموعد المحدد</p>
            </div>
          </AnimatedItem>

          <AnimatedItem type="slideUp" delay={0.5}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-6 border border-[var(--border-color)]/30 text-center">
              <i className="fas fa-envelope text-4xl text-[var(--primary-color)] mb-3"></i>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">إشعار اختياري</h3>
              <p className="text-sm text-[var(--text-secondary)]">احصل على إشعار عبر البريد عند التسليم</p>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </div>
  );
};

export default CreateFutureMessagePage;
