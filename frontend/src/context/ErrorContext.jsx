import React, { createContext, useContext, useState } from 'react';
import ErrorDialog from '../components/ErrorDialog.jsx';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({ isVisible: false, message: '', title: 'خطأ' });

  const showError = (message, title = 'خطأ') => {
    // Extract only the user-friendly message part, removing technical details
    let userMessage = message;
    
    // If the message contains technical details, extract only the meaningful part
    if (message.includes(':')) {
      const parts = message.split(':');
      // Look for the part that contains Arabic text or meaningful message
      userMessage = parts.find(part => /[\u0600-\u06FF]/.test(part.trim())) || parts[parts.length - 1];
      userMessage = userMessage.trim();
    }
    
    // Only show user-related errors, backend errors should be fixed
    if (userMessage.includes('E11000')) {
      userMessage = 'البريد الإلكتروني مستخدم مسبقاً';
    } else if (userMessage.includes('invalid') || userMessage.includes('Invalid')) {
      userMessage = 'بيانات غير صالحة، يرجى التحقق من المدخلات';
    } else if (userMessage.includes('not found') || userMessage.includes('Not found')) {
      userMessage = 'لم يتم العثور على البيانات المطلوبة';
    } else if (userMessage.includes('Unauthorized') || userMessage.includes('unauthorized')) {
      userMessage = 'غير مصرح بالوصول، يرجى تسجيل الدخول';
    }
    
    setError({ isVisible: true, message: userMessage, title });
  };

  const hideError = () => {
    setError({ isVisible: false, message: '', title: 'خطأ' });
  };

  const value = {
    showError,
    hideError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorDialog
        message={error.message}
        title={error.title}
        isVisible={error.isVisible}
        onClose={hideError}
      />
    </ErrorContext.Provider>
  );
};