import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../context/ToastContext.jsx';

const REPORT_REASONS = [
  { value: 'spam', label: 'محتوى مزعج (Spam)', icon: 'fa-bullhorn' },
  { value: 'harassment', label: 'مضايقة أو تنمر', icon: 'fa-user-slash' },
  { value: 'hate_speech', label: 'خطاب كراهية', icon: 'fa-exclamation-triangle' },
  { value: 'misinformation', label: 'معلومات مضللة', icon: 'fa-info-circle' },
  { value: 'self_harm', label: 'إيذاء النفس', icon: 'fa-heart-broken' },
  { value: 'violence', label: 'عنف', icon: 'fa-fist-raised' },
  { value: 'sexual_content', label: 'محتوى جنسي', icon: 'fa-eye-slash' },
  { value: 'copyright', label: 'انتهاك حقوق النشر', icon: 'fa-copyright' },
  { value: 'other', label: 'سبب آخر', icon: 'fa-flag' },
];

const ReportModal = ({ targetType, targetId, onClose }) => {
  const { success, error: showError } = useToast();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReason) {
      showError('يرجى اختيار سبب الإبلاغ');
      return;
    }

    try {
      setSubmitting(true);

      const { reportsAPI } = await import('../../services/communityApi.js');
      await reportsAPI.create({
        targetType,
        targetId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      success('تم إرسال البلاغ بنجاح، سيتم مراجعته من قبل الإدارة');
      onClose();
    } catch (error) {
      showError(error.message || 'فشل إرسال البلاغ');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <i className="fas fa-flag text-red-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">الإبلاغ عن محتوى</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">معلومة مهمة:</p>
                <p>سيتم مراجعة بلاغك بشكل سري من قبل فريق الإدارة. البلاغات الكاذبة قد تعرض حسابك للإيقاف.</p>
              </div>
            </div>
          </div>

          {/* Report Reasons */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-3">
              سبب الإبلاغ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => setSelectedReason(reason.value)}
                  className={`p-4 rounded-xl border-2 text-right transition-all duration-300 ${
                    selectedReason === reason.value
                      ? 'border-red-500 bg-red-500/10 text-red-500'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--primary-color)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fas ${reason.icon} text-xl`}></i>
                    <span className="font-medium">{reason.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              وصف إضافي (اختياري)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أضف أي تفاصيل إضافية قد تساعد في المراجعة..."
              rows="4"
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-[var(--border-color)]/30">
            <button
              type="submit"
              disabled={submitting || !selectedReason}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  إرسال البلاغ
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReportModal;
