import React, { useEffect } from 'react';
import AnimatedItem from './AnimatedItem.jsx';

/**
 * Reusable Confirmation Dialog Component
 * @param {boolean} isOpen - Dialog visibility state
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {boolean} isDanger - Danger style (red) or normal style
 * @param {function} onConfirm - Confirm callback
 * @param {function} onCancel - Cancel callback
 * @param {boolean} isLoading - Loading state
 */
const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'تأكيد', 
  cancelText = 'إلغاء',
  isDanger = false,
  onConfirm, 
  onCancel,
  isLoading = false 
}) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      {/* Dialog */}
      <AnimatedItem type="scale" delay={0.1}>
        <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 max-w-md w-full p-6 sm:p-8">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDanger 
              ? 'bg-red-500/20 text-red-500' 
              : 'bg-amber-500/20 text-amber-500'
          }`}>
            <i className={`fas ${isDanger ? 'fa-exclamation-triangle' : 'fa-question-circle'} text-3xl`}></i>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-[var(--text-secondary)] text-center mb-6 whitespace-pre-line">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-all duration-300 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDanger
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري التحميل...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default ConfirmDialog;
