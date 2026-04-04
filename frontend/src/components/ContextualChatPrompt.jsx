import React from 'react';
import { useAuth } from '../context/AuthContext';

const ContextualChatPrompt = ({ message, icon = 'fa-comments', text }) => {
  const { user } = useAuth();

  // Hide for admins
  if (user?.role === 'admin') return null;

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('openChat', { detail: { message } }));
  };

  return (
    <button
      onClick={handleOpenChat}
      className="flex items-center gap-2 px-4 py-3 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 rounded-xl text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-all text-sm font-medium group w-full sm:w-auto justify-center"
    >
      <i className={`fas ${icon} group-hover:animate-bounce`}></i>
      <span>{text}</span>
    </button>
  );
};

export default ContextualChatPrompt;
