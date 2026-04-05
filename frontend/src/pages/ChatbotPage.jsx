import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { io } from 'socket.io-client';
import DOMPurify from 'dompurify';
import { API_URL, SOCKET_URL } from '../config.js';

const ChatbotPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token } = useAuth();
  const { error: showError, success } = useToast();
  const socketRef = useRef(null);
  const initialMessage = location.state?.initialMessage;

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [skipCount, setSkipCount] = useState(0);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // Quick replies
  const quickReplies = [
    { icon: '🫂', text: 'أريد نصيحة' },
    { icon: '😟', text: 'أشعر بالقلق' },
    { icon: '😔', text: 'أنا حزين' },
    { icon: '🤔', text: 'كيف حالك؟' },
  ];

  const starterQuestions = [
    { icon: '💬', text: 'أريد التحدث عن مشاعري', prompt: 'أريد التحدث عن مشاعري، هل يمكنك مساعدتي؟' },
    { icon: '🧘', text: 'أحتاج تمارين استرخاء', prompt: 'هل يمكنك اقتراح تمارين استرخاء بسيطة؟' },
    { icon: '😰', text: 'أشعر بالتوتر', prompt: 'أشعر بالتوتر والضغط lately، ماذا أفعل؟' },
    { icon: '😴', text: 'أعاني من الأرق', prompt: 'أعاني من مشاكل في النوم، هل لديك نصائح؟' },
  ];

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      initializeSocket();
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  const initializeSocket = () => {
    try {
      const socket = io(`${SOCKET_URL}/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 500,
        timeout: 5000,
        forceNew: true,
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
      });
      socket.on('bot_response', (data) => {
        setIsLoading(false);
        setMessages(prev => [...prev, {
          ...data.message,
          id: data.message.id,
          text: data.message.text,
          sender: data.message.sender,
          reportData: data.message.reportData || null,
          messageType: data.message.messageType || 'text',
          relatedResources: data.message.relatedResources || [],
        }]);
        scrollToBottom();
      });
      socket.on('bot_typing', (data) => {
        setIsLoading(data.isTyping);
      });
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setIsLoading(false);
      });
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsLoading(false);
      });
      socketRef.current = socket;
    } catch (error) {}
  };

  // Initialize or get active chat session
  useEffect(() => {
    if (isAuthenticated && user) {
      getOrCreateSession();
    } else {
      // Show welcome message for non-authenticated users
      setMessages([{
        id: 'welcome',
        text: 'مرحباً! سجل دخولك للاستفادة من مساعد وعي الذكي والحصول على الدعم النفسي.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isAuthenticated, user]);

  // Handle initial message from contextual triggers
  useEffect(() => {
    if (initialMessage) {
      setInputValue(initialMessage);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [initialMessage]);

  const getOrCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');
      const activeResponse = await fetch(`${API_URL}/chat/sessions/active`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (activeResponse.ok) {
        const text = await activeResponse.text();
        if (text) {
          const session = JSON.parse(text);
          if (session && session._id) {
            setCurrentSession(session);
            setSkipCount(0);
            setHasMoreMessages(true);
            loadMessages(session._id, 0);
            return;
          }
        }
      }

      const createResponse = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (createResponse.ok) {
        const text = await createResponse.text();
        if (text) {
          setCurrentSession(JSON.parse(text));
        }
      }
    } catch (error) {}
  };

  const loadMessages = async (sessionId, skip = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages?limit=20&skip=${skip}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const msgs = await response.json();
        if (msgs.length > 0) {
          const newMessages = msgs.map(msg => ({
            id: msg._id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.createdAt),
            emotions: msg.emotions,
            relatedResources: msg.relatedResources || [],
            reportData: msg.reportData || null,
            messageType: msg.messageType || 'text',
          })).reverse();

          if (skip === 0) {
            setMessages(newMessages);
            scrollToBottom();
          } else {
            setMessages(prev => [...newMessages, ...prev]);
          }

          setHasMoreMessages(msgs.length === 20);
          setSkipCount(skip + msgs.length);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {}
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || isLoadingMore || !hasMoreMessages) return;
    if (container.scrollTop < 10) {
      setIsLoadingMore(true);
      const oldScrollHeight = container.scrollHeight;
      const oldScrollTop = container.scrollTop;
      loadMessages(currentSession._id, skipCount).then(() => {
        setIsLoadingMore(false);
        requestAnimationFrame(() => {
          container.scrollTop = (container.scrollHeight - oldScrollHeight) + oldScrollTop;
        });
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && currentSession) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentSession, isLoadingMore, hasMoreMessages, skipCount]);

  const handleQuickReply = (text) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || !currentSession) return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const userMessage = inputValue;
    setInputValue('');
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Send via socket if connected
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        sessionId: currentSession._id,
        content: userMessage,
        analyzeEmotions: true,
      });
      socketRef.current.emit('start_typing', { sessionId: currentSession._id });
    } else {
      // Fallback to REST
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Use AbortController for timeout (AI processing can take time)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 95000); // 95s timeout

        const response = await fetch(`${API_URL}/chat/sessions/${currentSession._id}/messages`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'user', content: userMessage, analyzeEmotions: true }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json();
        if (data.error) {
          setMessages(prev => [...prev, { id: Date.now() + 1, text: data.error, sender: 'bot', timestamp: new Date(), isError: true }]);
        }
        if (data.botMessage?.content) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: data.botMessage.content,
            sender: 'bot',
            timestamp: new Date(),
            emotions: data.analysis?.emotions,
            relatedResources: data.botMessage.relatedResources || [],
            reportData: data.botMessage.reportData || null,
            messageType: data.botMessage.messageType || 'text',
          }]);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          showError('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى');
        } else {
          showError('حدث خطأ، يرجى المحاولة مرة أخرى');
        }
      } finally { setIsLoading(false); }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const getEmotionColor = (emotion) => {
    const colors = {
      sad: 'text-blue-500 bg-blue-500/10',
      anxious: 'text-yellow-500 bg-yellow-500/10',
      angry: 'text-red-500 bg-red-500/10',
      happy: 'text-green-500 bg-green-500/10',
      stressed: 'text-orange-500 bg-orange-500/10',
      neutral: 'text-gray-500 bg-gray-500/10',
    };
    return colors[emotion?.toLowerCase()] || 'text-gray-500 bg-gray-500/10';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('تم نسخ الرسالة');
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen flex items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-3xl shadow-2xl border border-[var(--border-color)]/30 p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
            <i className="fas fa-robot text-5xl text-white -rotate-12"></i>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">مساعد وعي الذكي</h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            محادثات ذكية مع فهم عاطفي، ودعم نفسي أولي مبني على الاستماع والتعاطف.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no messages yet
  const isEmptyChat = messages.length === 0;

  return (
    <div className="bg-[var(--bg-primary)] h-screen flex flex-col overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)]/30 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)] transition-all shadow-lg"
        title="العودة"
      >
        <i className="fas fa-arrow-right"></i>
      </button>

      {/* Chat Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-2 sm:p-3 md:p-4 flex flex-col min-h-0">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-[var(--border-color)]/30 flex-1 flex flex-col overflow-hidden relative">

          {/* Messages */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 min-h-0 scroll-smooth">
            {isLoadingMore && (
              <div className="sticky top-0 flex justify-center py-2 bg-[var(--card-bg)]/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-full shadow-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
                  <span className="text-xs text-[var(--text-secondary)]">جاري تحميل الرسائل القديمة...</span>
                </div>
              </div>
            )}

            <div ref={messagesStartRef} />

            {messages.map((message) => (
              <div key={message.id} className={`flex mb-2 sm:mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-1.5 sm:gap-2.5 max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--primary-color)]'
                  }`}>
                    {message.sender === 'user' && user?.avatar ? (
                      <img src={user.avatar.startsWith('/') ? `${API_URL}${user.avatar}` : user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <i className={`fas ${message.sender === 'user' ? 'fa-user' : 'fa-robot'} text-xs sm:text-sm`}></i>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`group relative px-4 py-2.5 rounded-2xl shadow-sm text-sm sm:text-base flex flex-col items-end ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-br-md'
                        : 'bg-[var(--card-bg)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border-color)]/20'
                    }`}
                    onMouseEnter={() => setHoveredMessageId(message.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {/* Copy button on hover (bot messages) — inside bubble, top-right corner */}
                    {message.sender === 'bot' && hoveredMessageId === message.id && !message.isError && !message.isCrisis && (
                      <button
                        onClick={() => copyToClipboard(message.text)}
                        className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform z-10"
                        title="نسخ"
                      >
                        <i className="fas fa-copy text-[9px]"></i>
                      </button>
                    )}

                    {/* Crisis Alert */}
                    {message.isCrisis && (
                      <div className="mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-exclamation-triangle text-red-500"></i>
                          <span className="font-bold text-red-500 text-xs">مهم جداً</span>
                        </div>
                        <p className="text-right text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                    )}

                    {/* Error Alert */}
                    {message.isError && (
                      <div className="mb-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="fas fa-exclamation-circle text-yellow-500"></i>
                          <span className="font-bold text-yellow-500 text-xs">خطأ</span>
                        </div>
                        <p className="text-right text-sm">{message.text}</p>
                      </div>
                    )}

                    {!message.isCrisis && !message.isError && (
                      <>
                        <p className="text-right leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />

                        {/* Emotions Display */}
                        {message.emotions && message.emotions.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-[var(--border-color)]/30">
                            <div className="flex flex-wrap gap-1.5">
                              {message.emotions.map((emotion, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getEmotionColor(emotion.emotion)}`}>
                                  <i className={`fas ${
                                    emotion.emotion === 'sad' ? 'fa-tear' :
                                    emotion.emotion === 'anxious' ? 'fa-wind' :
                                    emotion.emotion === 'angry' ? 'fa-angry' :
                                    emotion.emotion === 'happy' ? 'fa-smile' :
                                    emotion.emotion === 'stressed' ? 'fa-tired' :
                                    'fa-face-meh'
                                  }`}></i>
                                  <span className="capitalize">{emotion.emotion}</span>
                                  <span className="opacity-60">({Math.round(emotion.confidence * 100)}%)</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions as clickable chips */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {message.suggestions.map((suggestion, idx) => (
                              <button key={idx} onClick={() => { setInputValue(suggestion); inputRef.current?.focus(); }}
                                className="px-3 py-1.5 rounded-lg text-xs bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)] hover:text-white transition-all hover:scale-105">
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Clinical Report Card */}
                        {message.reportData && (
                          <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-3">
                              <i className="fas fa-file-medical text-blue-500"></i>
                              <span className="font-bold text-blue-700 dark:text-blue-300">التقرير الطبي الموجز</span>
                            </div>

                            {/* Symptoms */}
                            {message.reportData.symptoms && Array.isArray(message.reportData.symptoms) && message.reportData.symptoms.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-[var(--text-primary)] mb-1 flex items-center gap-1">
                                  <i className="fas fa-stethoscope text-blue-400"></i> الأعراض الرئيسية
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {message.reportData.symptoms.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Duration & Impact */}
                            {(message.reportData.duration || message.reportData.impact) && (
                              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                                {message.reportData.duration && (
                                  <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                                    <i className="fas fa-clock text-amber-400"></i>
                                    <span>المدة: {message.reportData.duration}</span>
                                  </div>
                                )}
                                {message.reportData.severity && (
                                  <div className="flex items-center gap-1">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                      message.reportData.severity === 'شديد' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                      message.reportData.severity === 'متوسط' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>{message.reportData.severity}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Recommendations */}
                            {message.reportData.recommendations && Array.isArray(message.reportData.recommendations) && message.reportData.recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-[var(--text-primary)] mb-1 flex items-center gap-1">
                                  <i className="fas fa-lightbulb text-amber-400"></i> التوصيات
                                </p>
                                <ul className="space-y-1">
                                  {message.reportData.recommendations.map((r, i) => (
                                    <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                                      <span className="text-blue-400 mt-0.5">•</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p className="text-[10px] text-[var(--text-secondary)] mt-3 pt-2 border-t border-blue-200 dark:border-blue-800 italic">
                              ⚠️ هذا التقرير موجز أولي ولا يُغني عن الاستشارة الطبية المتخصصة.
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Timestamp on hover */}
                    <span className={`text-[9px] mt-1 block opacity-0 group-hover:opacity-60 transition-opacity ${
                      message.sender === 'user' ? 'text-white text-left' : 'text-[var(--text-secondary)] text-right'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-2 sm:mb-3">
                <div className="flex items-end gap-1.5 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[var(--bg-secondary)] text-[var(--primary-color)] flex items-center justify-center flex-shrink-0 shadow-md">
                    <i className="fas fa-robot text-xs sm:text-sm"></i>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] rounded-bl-md border border-[var(--border-color)]/20 shadow-sm">
                    <div className="flex space-x-1.5 space-x-reverse">
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies below bot messages */}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
              <div className="flex justify-start mt-1 ml-9 sm:ml-11">
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply, i) => (
                    <button key={i} onClick={() => handleQuickReply(reply.text)}
                      className="px-3 py-1.5 rounded-full text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10 hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]/30 transition-all">
                      {reply.icon} {reply.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Empty State */}
          {isEmptyChat && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-robot text-4xl text-[var(--primary-color)]"></i>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">مرحباً {user?.firstName || 'صديقي'} 👋</h3>
                <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">
                  أنا مساعد وعي الذكي، هنا لأستمع إليك وأقدم لك الدعم. اختر أحد المواضيع أو اكتب ما تشعر به.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {starterQuestions.map((q, i) => (
                    <button key={i} onClick={() => { setInputValue(q.prompt); inputRef.current?.focus(); }}
                      className="flex items-center gap-3 px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)]/30 rounded-xl hover:border-[var(--primary-color)]/50 hover:shadow-lg transition-all text-left group pointer-events-auto">
                      <span className="text-2xl">{q.icon}</span>
                      <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]/30 flex-shrink-0">
            <div className="flex gap-2 sm:gap-3 items-end">
              <textarea
                ref={textareaRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => {
                  setTimeout(() => {
                    if (messagesEndRef.current) {
                      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                  }, 100);
                }}
                placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                rows={1}
                className="flex-1 min-w-0 px-3 sm:px-5 py-3 sm:py-4 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-lg sm:rounded-xl focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm sm:text-base resize-none overflow-hidden max-h-[120px]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-1.5 sm:gap-2 hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <i className="fas fa-paper-plane text-base sm:text-lg"></i>
                <span className="hidden sm:inline font-medium">إرسال</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
