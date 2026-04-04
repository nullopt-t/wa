import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingChatButton = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle contextual triggers - open chatbot page with message
  useEffect(() => {
    const handleChatTrigger = (e) => {
      if (e.detail?.message) {
        navigate('/chatbot', { state: { initialMessage: e.detail.message } });
      }
    };
    window.addEventListener('openChat', handleChatTrigger);
    return () => window.removeEventListener('openChat', handleChatTrigger);
  }, [navigate]);

  // Hide for admins and on admin pages
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (!isAuthenticated || user?.role === 'admin' || isAdminRoute) return null;

  const isChatPage = location.pathname === '/chatbot';

  return (
    <button
      onClick={() => isChatPage ? navigate(-1) : navigate('/chatbot')}
      className={`fixed bottom-6 right-6 z-[9997] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
        isChatPage
          ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30 rotate-0 hover:rotate-90'
          : 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] hover:shadow-[var(--primary-color)]/30 hover:scale-110'
      }`}
      aria-label={isChatPage ? 'إغلاق المساعد' : 'فتح المساعد الذكي'}
    >
      <i className={`fas text-xl ${isChatPage ? 'fa-times group-hover:rotate-90' : 'fa-robot group-hover:animate-bounce'}`}></i>
      {!isChatPage && (
        <span className="absolute -inset-1 rounded-full bg-[var(--primary-color)]/20 animate-ping pointer-events-none"></span>
      )}
    </button>
  );
};

export default FloatingChatButton;
