import React from 'react';

const SuccessDialog = ({ message, isVisible, onClose, title = "نجاح" }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-primary)] bg-opacity-70 backdrop-blur-sm">
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl border border-[var(--border-color)] w-full max-w-md overflow-hidden">
        <div className="bg-green-500 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-green-500 text-xl"></i>
              </div>
            </div>
            <div className="mr-4">
              <p className="text-[var(--text-primary)] text-lg">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--bg-secondary)] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            حسناً
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;