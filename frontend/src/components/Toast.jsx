import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Toast Message Component
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Type of toast
 * @param {boolean} props.show - Whether to show the toast
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 */
const Toast = ({ message, type = 'info', show, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  const bgColors = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-rose-600',
    warning: 'from-amber-500 to-orange-600',
    info: 'from-blue-500 to-indigo-600',
  };

  const borderColors = {
    success: 'border-green-600',
    error: 'border-red-600',
    warning: 'border-amber-600',
    info: 'border-blue-600',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-4 z-[100] min-w-[320px] max-w-md"
        >
          <div className={`bg-gradient-to-r ${bgColors[type]} text-white rounded-xl shadow-2xl border-2 ${borderColors[type]} overflow-hidden`}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0">
                <i className={`fas ${icons[type]} text-xl`}></i>
              </div>
              <p className="flex-1 font-medium text-sm leading-relaxed">{message}</p>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            {/* Progress bar */}
            {duration > 0 && (
              <div className="h-1 bg-white/20">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                  className="h-full bg-white/40"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
