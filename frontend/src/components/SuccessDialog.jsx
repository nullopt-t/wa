import React, { useEffect } from 'react';
import AnimatedItem from './AnimatedItem.jsx';

const SuccessDialog = ({ message, isVisible, onClose, title = "نجاح" }) => {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <AnimatedItem type="scale" delay={0.1}>
        <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 max-w-md w-full p-6 sm:p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check-circle text-4xl"></i>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-[var(--text-secondary)] text-center mb-6">
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-300"
          >
            <i className="fas fa-check ml-2"></i>
            حسناً
          </button>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default SuccessDialog;
