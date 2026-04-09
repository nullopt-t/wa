import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Animated Confirmation Dialog Component
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
    <AnimatePresence>
      {/* Animated Backdrop */}
      <motion.div
        key="confirm-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Animated Dialog */}
      <div
        key="confirm-dialog"
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, rotate: 5 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 500,
            duration: 0.3
          }}
          className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-3xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-md pointer-events-auto overflow-hidden"
        >
          {/* Animated Icon Header with Gradient */}
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", damping: 15 }}
            className={`w-24 h-24 mx-auto mt-6 rounded-full flex items-center justify-center ${
              isDanger 
                ? 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-500' 
                : 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-500'
            }`}
          >
            <motion.i 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 12 }}
              className={`fas text-4xl ${
                isDanger ? 'fa-exclamation-triangle' : 'fa-question-circle'
              }`}
            ></motion.i>
          </motion.div>

          {/* Content */}
          <div className="p-6 text-center">
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-[var(--text-primary)] mb-3"
            >
              {title}
            </motion.h3>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[var(--text-secondary)] mb-6 whitespace-pre-line"
            >
              {message}
            </motion.p>

            {/* Action Buttons with Hover Effects */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]/50 transition-all duration-300 disabled:opacity-50 shadow-lg"
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg ${
                  isDanger
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/30'
                    : 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white hover:from-[var(--primary-hover)] hover:to-[var(--secondary-hover)] shadow-[var(--primary-color)]/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.i 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="fas fa-spinner"
                    ></motion.i>
                    جاري...
                  </>
                ) : (
                  confirmText
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
