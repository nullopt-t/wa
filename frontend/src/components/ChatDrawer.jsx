import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';
import { API_URL, SOCKET_URL } from '../config';

const ChatDrawer = ({ isOpen, onClose, initialMessage }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useAuth();
  const { error: showError } = useToast();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(() => sessionStorage.getItem('chat_draft') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const initialMessageRef = useRef(initialMessage);

  // Save draft to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('chat_draft', inputValue);
  }, [inputValue]);

  // Handle initial message from contextual triggers
  useEffect(() => {
    if (initialMessage && initialMessage !== initialMessageRef.current && isOpen) {
      initialMessageRef.current = initialMessage;
      setInputValue(initialMessage);
      textareaRef.current?.focus();
    }
  }, [initialMessage, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [inputValue]);

  useEffect(() => {
    if (isOpen && isAuthenticated && token && !sessionInitialized) {
      initializeSocket();
      getOrCreateSession();
      setSessionInitialized(true);
    }
    return () => {
      // Don't disconnect on close - keep socket alive
    };
  }, [isOpen, isAuthenticated, token]);

  const initializeSocket = () => {
    if (socketRef.current?.connected) return;
    try {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        forceNew: true,
      });
      socket.on('bot_response', (data) => {
        // Typing animation delay
        const delay = 800 + Math.random() * 1200;
        setTimeout(() => {
          setMessages(prev => [...prev, {
            ...data.message, id: data.message.id, text: data.message.text,
            sender: data.message.sender, reportData: data.message.reportData || null,
            messageType: data.message.messageType || 'text',
            relatedResources: data.message.relatedResources || [],
          }]);
          scrollToBottom();
        }, delay);
      });
      socket.on('bot_typing', (data) => setIsLoading(data.isTyping));
      socket.on('error', (error) => console.error('Socket error:', error));
      socketRef.current = socket;
    } catch (error) {}
  };

  const getOrCreateSession = async () => {
    try {
      const t = localStorage.getItem('token');
      const activeResponse = await fetch(`${API_URL}/chat/sessions/active`, {
        headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      });
      if (activeResponse.ok) {
        const text = await activeResponse.text();
        if (text) {
          const session = JSON.parse(text);
          if (session?._id) {
            setCurrentSession(session);
            loadMessages(session._id, 0);
            return;
          }
        }
      }
      const createResponse = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (createResponse.ok) {
        const text = await createResponse.text();
        if (text) setCurrentSession(JSON.parse(text));
      }
    } catch (error) {}
  };

  const loadMessages = async (sessionId, skip = 0) => {
    try {
      const t = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages?limit=20&skip=${skip}`, {
        headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const msgs = await response.json();
        if (msgs.length > 0) {
          const newMessages = msgs.map(msg => ({
            id: msg._id, text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.createdAt),
            emotions: msg.emotions, relatedResources: msg.relatedResources || [],
            reportData: msg.reportData || null, messageType: msg.messageType || 'text',
          })).reverse();
          setMessages(newMessages);
        }
      }
    } catch (error) {}
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !currentSession) return;
    const newUserMessage = { id: Date.now(), text: inputValue, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    const userMessage = inputValue;
    setInputValue('');
    sessionStorage.removeItem('chat_draft');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', { sessionId: currentSession._id, content: userMessage, analyzeEmotions: true });
      socketRef.current.emit('start_typing', { sessionId: currentSession._id });
    } else {
      setIsLoading(true);
      try {
        const t = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/sessions/${currentSession._id}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', content: userMessage, analyzeEmotions: true }),
        });
        const data = await response.json();
        if (data.error) {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: data.error, sender: 'bot', timestamp: new Date(), isError: true }]);
        }
        if (data.botMessage?.content) {
          // Typing animation delay
          const delay = 800 + Math.random() * 1200;
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + 1, text: data.botMessage.content, sender: 'bot',
              timestamp: new Date(), emotions: data.analysis?.emotions,
              relatedResources: data.botMessage.relatedResources || [],
              reportData: data.botMessage.reportData || null,
              messageType: data.botMessage.messageType || 'text',
            }]);
          }, delay);
        }
      } catch (error) { showError('حدث خطأ، حاول تاني'); } finally { setIsLoading(false); }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const getEmotionColor = (emotion) => {
    const colors = { sad: 'text-blue-500 bg-blue-500/10', anxious: 'text-yellow-500 bg-yellow-500/10', angry: 'text-red-500 bg-red-500/10', happy: 'text-green-500 bg-green-500/10', stressed: 'text-orange-500 bg-orange-500/10' };
    return colors[emotion?.toLowerCase()] || 'text-gray-500 bg-gray-500/10';
  };

  if (!isOpen) return null;

  const isEmptyChat = messages.length === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-4 md:w-[420px] md:max-w-[calc(100%-2rem)] bg-[var(--card-bg)] rounded-t-2xl md:rounded-2xl border-t md:border border-[var(--border-color)]/30 shadow-2xl z-[9999] flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)', height: '85vh' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-robot text-lg text-white"></i>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">مساعد وعي الذكي</h3>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                متاح الآن
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Empty State */}
          {isEmptyChat && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-robot text-3xl text-[var(--primary-color)]"></i>
                </div>
                <h4 className="font-bold text-[var(--text-primary)] mb-2">أهلاً بيك {user?.firstName || 'صديقي'} 👋</h4>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--primary-color)]'
                }`}>
                  {message.sender === 'user' && user?.avatar ? (
                    <img src={user.avatar.startsWith('/') ? `${API_URL}${user.avatar}` : user.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <i className={`fas ${message.sender === 'user' ? 'fa-user' : 'fa-robot'} text-xs`}></i>
                  )}
                </div>

                {/* Bubble */}
                <div className={`group relative px-3 py-2 rounded-xl text-sm shadow-sm flex flex-col items-end ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-br-md'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border-color)]/20'
                }`}
                  onMouseEnter={() => setHoveredMessageId(message.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}>

                  {/* Copy button — inside bubble, top-right */}
                  {message.sender === 'bot' && hoveredMessageId === message.id && !message.isError && (
                    <button onClick={() => { navigator.clipboard.writeText(message.text); }}
                      className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform z-10">
                      <i className="fas fa-copy text-[9px]"></i>
                    </button>
                  )}

                  {message.isError ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 w-full">
                      <p className="text-yellow-500 text-xs">{message.text}</p>
                    </div>
                  ) : message.sender === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />

                      {/* Emotions */}
                      {message.emotions?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[var(--border-color)]/30 flex flex-wrap gap-1">
                          {message.emotions.map((e, i) => (
                            <span key={i} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ${getEmotionColor(e.emotion)}`}>
                              <i className={`fas ${e.emotion === 'sad' ? 'fa-tear' : e.emotion === 'anxious' ? 'fa-wind' : 'fa-face-meh'}`}></i>
                              {e.emotion}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Report Card */}
                      {message.reportData && !message.reportData.testQuestions && (
                        <div data-report="true" className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <i className="fas fa-file-medical text-blue-500 text-xs"></i>
                              <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">تقرير موجز</span>
                            </div>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const card = e.currentTarget.closest('[data-report]');
                              if (!card) return;
                              const opt = {
                                margin: 5,
                                filename: `تقرير-وعي-${Date.now()}.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2, useCORS: true },
                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                              };
                              html2pdf().set(opt).from(card).save();
                            }} className="text-blue-500 hover:text-blue-700 transition-colors" title="تحميل PDF">
                              <i className="fas fa-download text-xs"></i>
                            </button>
                          </div>
                          {message.reportData.symptoms && Array.isArray(message.reportData.symptoms) && message.reportData.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {message.reportData.symptoms.map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px]">{s}</span>
                              ))}
                            </div>
                          )}
                          {message.reportData.severity && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              message.reportData.severity.includes('شديد') ? 'bg-red-100 text-red-700' :
                              message.reportData.severity.includes('متوسط') ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>{message.reportData.severity}</span>
                          )}
                          {message.reportData.recommendations && Array.isArray(message.reportData.recommendations) && message.reportData.recommendations.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 mb-1">التوصيات:</p>
                              <ul className="space-y-0.5">
                                {message.reportData.recommendations.map((r, i) => (
                                  <li key={i} className="text-[10px] text-blue-600 dark:text-blue-400 flex items-start gap-1">
                                    <span>•</span><span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resource Cards */}
                      {message.relatedResources?.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {message.relatedResources.map((res, i) => (
                            <a key={i} href={res.url} className="block p-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm">{res.type === 'article' ? '📄' : '🎥'}</span>
                                <p className="text-xs font-medium text-[var(--text-primary)] line-clamp-1">{res.title}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[8px] mt-0.5 block opacity-0 group-hover:opacity-60 transition-opacity text-[var(--text-secondary)]">
                    {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start mb-2">
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] text-[var(--primary-color)] flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-xs"></i>
                </div>
                <div className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/20">
                  <div className="flex space-x-1 space-x-reverse">
                    <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/50 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => {
                setTimeout(() => {
                  if (textareaRef.current && messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }
                }, 100);
              }}
              placeholder="اكتب رسالتك هنا..."
              rows={1}
              className="flex-1 px-3 py-2 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm resize-none overflow-hidden max-h-[80px]"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="w-10 h-10 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatDrawer;
