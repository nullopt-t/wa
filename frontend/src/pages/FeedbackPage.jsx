import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { feedbackAPI } from '../services/feedbackApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const FeedbackPage = () => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    content: '',
    category: 'other',
  });

  // Load public reviews on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await feedbackAPI.getPublic(1, 10);
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedRating === 0) {
      showError('الرجاء اختيار تقييم بالنجوم');
      return;
    }

    if (formData.content.length < 10) {
      showError('الرجاء كتابة تعليق أطول (10 أحرف على الأقل)');
      return;
    }

    setLoading(true);
    try {
      const response = await feedbackAPI.submit(formData);
      if (response.success) {
        success('تم إرسال ملاحظاتك بنجاح، شكراً لمشاركتك!');
        // Reset form
        setFormData({ name: '', email: '', rating: 0, content: '', category: 'other' });
        setSelectedRating(0);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError(error.message || 'فشل إرسال الملاحظة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">آراء وتغذية راجعة</h1>
          <p className="text-xl text-[var(--text-secondary)]">أعطنا رأيك، واترك لنا فيدباك مميز وبكل صراحة</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">آراء المستخدمين</h2>
            <p className="text-xl text-[var(--text-secondary)]">ما يقوله مستخدمو منصة وعي عن تجربتهم</p>
          </div>

          <div className="space-y-8">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <AnimatedItem key={review._id} type="slideUp" delay={index * 0.1}>
                  <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {review.userId?.avatar || review.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-right">
                          <h4 className="text-xl font-bold text-[var(--text-primary)]">
                            {review.userId?.firstName || review.name}
                          </h4>
                          <p className="text-[var(--text-secondary)]">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
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
                      {review.adminResponse && (
                        <span className="flex items-center gap-2 text-[var(--primary-color)]">
                          <i className="fas fa-reply"></i> تم الرد
                        </span>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-comments text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <p className="text-xl text-[var(--text-secondary)]">كن أول من يترك تعليقاً!</p>
              </div>
            )}
          </div>

          <div className="mt-16 bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg border border-[var(--border-color)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-4">اترك لنا أثراً جميلاً</h2>
              <p className="text-[var(--text-secondary)]">شاركنا رأيك وتجربتك مع منصة وعي</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-right">
                <label htmlFor="feedback-name" className="block text-lg font-medium text-[var(--text-primary)] mb-4">الاسم</label>
                <input
                  type="text"
                  id="feedback-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="الاسم"
                  required
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                />
              </div>

              <div className="text-right">
                <label htmlFor="feedback-email" className="block text-lg font-medium text-[var(--text-primary)] mb-4">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="feedback-email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="البريد الإلكتروني"
                  required
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                />
              </div>

              <div className="text-right">
                <label className="block text-lg font-medium text-[var(--text-primary)] mb-4">تقييمك</label>
                <div className="flex justify-end gap-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`transition-colors ${star <= selectedRating ? 'text-amber-500' : 'text-gray-300'}`}
                      onClick={() => handleStarClick(star)}
                    >
                      <i className={`fas fa-star`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <label htmlFor="feedback-content" className="block text-lg font-medium text-[var(--text-primary)] mb-4">التعليق</label>
                <textarea
                  id="feedback-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="التعليق"
                  required
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors resize-vertical text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  rows="5"
                ></textarea>
              </div>

              <div className="text-right">
                <label htmlFor="feedback-category" className="block text-lg font-medium text-[var(--text-primary)] mb-4">الفئة</label>
                <select
                  id="feedback-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-amber)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                >
                  <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اختر فئة التعليق</option>
                  <option value="praise" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مديح</option>
                  <option value="suggestion" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">اقتراحات</option>
                  <option value="complaint" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">شكاوى</option>
                  <option value="technical" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">مشاكل تقنية</option>
                  <option value="other" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">أخرى</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ name: '', email: '', rating: 0, content: '', category: 'other' })}
                  className="px-6 py-3 border-2 border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-xl font-medium hover:bg-[var(--secondary-color)] hover:text-white transition-colors"
                >
                  مسح
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>إرسال التعليق</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;
