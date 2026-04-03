import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { io } from 'socket.io-client';
import DOMPurify from 'dompurify';

import { API_URL, SOCKET_URL } from '../config.js';
import { generateClinicalReportPDF } from '../utils/pdfGenerator.js';

const ChatbotPage = () => {
  const { isAuthenticated, user, token } = useAuth();
  const { error: showError, success } = useToast();
  const socketRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [skipCount, setSkipCount] = useState(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Show PDF button only after minimum messages
  const MIN_MESSAGES_FOR_REPORT = 5;
  const canGenerateReport = messages.length >= MIN_MESSAGES_FOR_REPORT;

  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

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
        // Connected
      });

      socket.on('bot_response', (data) => {
        setMessages(prev => [...prev, data.message]);
        setShouldScrollToBottom(true);
      });

      socket.on('bot_typing', (data) => {
        setIsLoading(data.isTyping);
      });

      socket.on('error', (error) => {
        // Log backend errors - should be fixed in backend
        console.error('Socket error - backend issue:', error);
      });

      socket.on('disconnect', () => {
        // Disconnected
      });

      socketRef.current = socket;
    } catch (error) {
      
    }
  };

  // Initialize or get active chat session
  useEffect(() => {
    if (isAuthenticated && user) {
      getOrCreateSession();
    } else {
      // For non-authenticated users, show welcome message
      setMessages([
        {
          id: 1,
          text: 'مرحباً! يرجى تسجيل الدخول للاستفادة من مساعد وعي الذكي.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  }, [isAuthenticated, user]);

  const getOrCreateSession = async () => {
    try {
      const token = localStorage.getItem('token');

      // Try to get active session first
      const activeResponse = await fetch(`${API_URL}/chat/sessions/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (activeResponse.ok) {
        const text = await activeResponse.text();
        if (text) {
          const session = JSON.parse(text);
          if (session && session._id) {
            setCurrentSession(session);
            setSkipCount(0);
            setHasMoreMessages(true);
            // Load existing messages
            loadMessages(session._id, 0);
            return;
          }
        }
      }

      // Create new session
      const createResponse = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (createResponse.ok) {
        const text = await createResponse.text();
        if (text) {
          const session = JSON.parse(text);
          setCurrentSession(session);
        }
      }
    } catch (error) {
      
    }
  };

  const loadMessages = async (sessionId, skip = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages?limit=20&skip=${skip}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const messages = await response.json();
        if (messages.length > 0) {
          const newMessages = messages.map(msg => ({
            id: msg._id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.createdAt),
            emotions: msg.emotions,
          })).reverse(); // Reverse to show oldest first

          if (skip === 0) {
            setMessages(newMessages);
            setShouldScrollToBottom(true); // Scroll for initial load
          } else {
            setMessages(prev => [...newMessages, ...prev]);
            // Don't scroll when loading old messages
          }

          setHasMoreMessages(messages.length === 20);
          setSkipCount(skip + messages.length);
        } else {
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || isLoadingMore || !hasMoreMessages) return;

    // If scrolled to top (within 10px)
    if (container.scrollTop < 10) {
      setIsLoadingMore(true);
      
      // Get current scroll position
      const oldScrollHeight = container.scrollHeight;
      const oldScrollTop = container.scrollTop;
      
      loadMessages(currentSession._id, skipCount).then(() => {
        setIsLoadingMore(false);
        
        // Maintain scroll position smoothly
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          const heightDiff = newScrollHeight - oldScrollHeight;
          
          // Smooth scroll to maintain position
          container.scrollTo({
            top: heightDiff + oldScrollTop,
            behavior: 'auto'
          });
        });
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && currentSession) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        if (container) {
          container.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [currentSession, isLoadingMore, hasMoreMessages, skipCount]);

  useEffect(() => {
    if (currentSession) {
      inputRef.current?.focus();
    }
  }, [currentSession]);

  // Export PDF - Client-side generation
  const handleExportPDF = async () => {
    if (!currentSession) {
      showError('لا توجد جلسة حالية');
      return;
    }
    
    setIsGeneratingReport(true);
    
    try {
      // First generate summary from backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/sessions/${currentSession._id}/summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const summary = await response.json();
        
        // Check if this is a valid therapy session
        if (!summary.isValidTherapySession) {
          showError(`لا يمكن إنشاء تقرير: ${summary.reason || 'المحادثة لا تحتوي على معلومات شخصية'}`);
          setIsGeneratingReport(false);
          return;
        }
        
        // Generate PDF on client-side with proper data extraction
        await generateClinicalReportPDF({
          symptom: summary.summary?.split('\n')[0]?.replace('الأعراض: ', '') || 'غير محدد',
          symptoms: summary.summary?.split('\n').filter(l => l.includes('•')).map(l => l.replace('• ', '')) || [],
          duration: summary.summary?.match(/المدة: (.+)/)?.[1] || 'غير محددة',
          functionalImpact: {
            work: summary.summary?.match(/العمل: (.+)/)?.[1] || 'غير محدد',
            sleep: summary.summary?.match(/النوم: (.+)/)?.[1] || 'غير محدد',
            relationships: summary.summary?.match(/العلاقات: (.+)/)?.[1] || 'غير محدد',
          },
          riskFactors: {
            selfHarm: summary.summary?.match(/إيذاء النفس: (.+)/)?.[1] || 'لم تُذكر',
            severity: summary.severity || 'متوسط',
          },
          preliminaryDiagnosis: 'بحاجة إلى تقييم كامل',
          clinicalRecommendations: summary.recommendations || [],
        });
        
        success('تم تحميل التقرير بنجاح!');
      }
    } catch (error) {
      
      ;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') {
      return;
    }

    // Check if user is asking for a report
    const reportKeywords = ['تقرير', 'pdf', 'تصدير', 'ارسل تقرير', 'أريد تقرير', 'صدّر'];
    const isAskingForReport = reportKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isAskingForReport) {
      // Trigger PDF export instead of sending message
      if (!canGenerateReport) {
        showError(`تحتاج على الأقل ${MIN_MESSAGES_FOR_REPORT} رسائل لتوليد التقرير`);
        return;
      }
      await handleExportPDF();
      setInputValue('');
      return;
    }

    if (!currentSession) {
      showError('جاري إنشاء الجلسة...');
      await getOrCreateSession();
      if (!currentSession) {
        showError('حدث خطأ، يرجى تحديث الصفحة');
        return;
      }
    }

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const userMessage = inputValue;
    setInputValue('');
    setShouldScrollToBottom(true); // Scroll for new message

    // Send via socket if connected
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', {
        sessionId: currentSession._id,
        content: userMessage,
        analyzeEmotions: true,
      });

      socketRef.current.emit('start_typing', {
        sessionId: currentSession._id,
      });
    } else {
      // Fallback to REST API
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/chat/sessions/${currentSession._id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'user',
            content: userMessage,
            analyzeEmotions: true,
          }),
        });

        const data = await response.json();

        if (data.error) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: data.error,
            sender: 'bot',
            timestamp: new Date(),
            isError: true
          }]);
        }

        if (data.botMessage && data.botMessage.content) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: data.botMessage.content,
            sender: 'bot',
            timestamp: new Date(),
            emotions: data.analysis?.emotions,
          }]);
        }
      } catch (error) {
        
        showError('حدث خطأ، يرجى المحاولة مرة أخرى');
      } finally {
        setIsLoading(false);
      }
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 10);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      sad: 'text-blue-500',
      anxious: 'text-yellow-500',
      angry: 'text-red-500',
      happy: 'text-green-500',
      stressed: 'text-orange-500',
      neutral: 'text-gray-500',
    };
    return colors[emotion?.toLowerCase()] || 'text-gray-500';
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-[var(--bg-primary)] h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl border border-[var(--border-color)]/30 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-robot text-4xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">مساعد وعي الذكي</h2>
          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            يرجى تسجيل الدخول للاستفادة من مساعد وعي الذكي والحصول على الدعم النفسي الأولي.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-md border-b border-[var(--border-color)]/30 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-robot text-base sm:text-xl text-white"></i>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">مساعد وعي الذكي</h1>
              <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] flex items-center gap-1 sm:gap-1.5">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="truncate">متاح الآن</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-2 sm:p-3 md:p-4 flex flex-col min-h-0">
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-[var(--border-color)]/30 flex-1 flex flex-col overflow-hidden">

          {/* Report Button - Top Right */}
          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={handleExportPDF}
              disabled={!canGenerateReport || isGeneratingReport}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all text-sm font-medium ${
                !canGenerateReport
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isGeneratingReport
                    ? 'bg-[var(--primary-color)]/50 text-white cursor-wait'
                    : 'bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)]'
              }`}
              title={
                !canGenerateReport 
                  ? `تحدث على الأقل ${MIN_MESSAGES_FOR_REPORT} رسائل لتوليد التقرير` 
                  : isGeneratingReport 
                    ? 'جاري إنشاء التقرير...' 
                    : 'تصدير تقرير PDF'
              }
            >
              {isGeneratingReport ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <i className="fas fa-file-pdf"></i>
              )}
              <span>{isGeneratingReport ? 'جاري...' : 'تقرير PDF'}</span>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 min-h-0 scroll-smooth"
          >
            {/* Loading More Indicator - Fixed at top */}
            {isLoadingMore && (
              <div className="sticky top-0 flex justify-center py-2 bg-[var(--card-bg)]/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-full shadow-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
                  <span className="text-xs text-[var(--text-secondary)]">جاري تحميل الرسائل القديمة...</span>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesStartRef} />
            
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex mb-2 sm:mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-1.5 sm:gap-2.5 max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] text-white' 
                      : 'bg-[var(--bg-secondary)] text-[var(--primary-color)]'
                  }`}>
                    <i className={`fas ${message.sender === 'user' ? 'fa-user' : 'fa-robot'} text-xs sm:text-sm`}></i>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`group px-4 py-2.5 rounded-2xl shadow-sm text-sm sm:text-base ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-br-md'
                      : 'bg-[var(--card-bg)] text-[var(--text-primary)] rounded-bl-md border border-[var(--border-color)]/20'
                  }`}>
                    {/* Crisis Alert */}
                    {message.isCrisis && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-exclamation-triangle text-red-500"></i>
                          <span className="font-bold text-red-500 text-xs">مهم جداً</span>
                        </div>
                        <p className="text-right text-sm whitespace-pre-wrap">{message.text}</p>
                      </div>
                    )}
                    
                    {/* Error Alert */}
                    {message.isError && (
                      <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="fas fa-exclamation-circle text-yellow-500"></i>
                          <span className="font-bold text-yellow-500 text-xs">خطأ</span>
                        </div>
                        <p className="text-right text-sm">{message.text}</p>
                      </div>
                    )}
                    
                    {!message.isCrisis && !message.isError && (
                      <>
                        <p
                          className="text-right leading-relaxed whitespace-pre-wrap break-words"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(message.text)
                          }}
                        />

                        {/* Assessment Question - Answer Buttons */}
                        {message.type === 'assessment_question' && message.assessmentData?.question && (
                          <AssessmentButtons
                            options={message.assessmentData.question.options}
                            onSelect={handleAssessmentAnswer}
                            disabled={assessmentState.isInAssessment && assessmentState.currentQuestion?.id !== message.assessmentData.question.id}
                          />
                        )}

                        {/* Assessment Results */}
                        {message.type === 'assessment_results' && message.assessmentResult && (
                          <AssessmentResults
                            result={message.assessmentResult}
                            onExportPDF={() => handleExportAssessmentPDF(message.assessmentResult)}
                          />
                        )}

                        {/* Emotions Display */}
                        {message.emotions && message.emotions.length > 0 && (
                          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--border-color)]/30">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                              {message.emotions.map((emotion, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-medium ${getEmotionColor(emotion.emotion)} bg-[var(--bg-secondary)]`}
                                >
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

                            {/* Suggestions as Buttons */}
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-2 flex flex-col gap-2">
                                <span className="text-[9px] sm:text-[10px] text-[var(--text-secondary)]">💡 اقتراحات:</span>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {message.suggestions.map((suggestion, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setInputValue(suggestion);
                                        inputRef.current?.focus();
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs sm:text-sm bg-gradient-to-r from-[var(--primary-color)]/10 to-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30 hover:bg-[var(--primary-color)] hover:text-white transition-all hover:scale-105 cursor-pointer"
                                    >
                                      <i className="fas fa-lightbulb"></i>
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Quick Test - Dynamic AI-Generated Questions */}
                            {message.quickTest && message.quickTest.questions && message.quickTest.questions.length > 0 && (
                              <div className="mt-3 p-4 bg-gradient-to-br from-[var(--primary-color)]/5 to-[var(--secondary-color)]/5 rounded-xl border border-[var(--primary-color)]/20">
                                <div className="flex items-center gap-2 mb-3">
                                  <i className="fas fa-clipboard-list text-[var(--primary-color)]"></i>
                                  <span className="font-bold text-[var(--primary-color)] text-sm">{message.quickTest.title || 'تقييم سريع'}</span>
                                </div>
                                <div className="space-y-2">
                                  {message.quickTest.questions.map((question, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                      <span className="flex-shrink-0 w-6 h-6 bg-[var(--primary-color)] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                      </span>
                                      <span className="text-[var(--text-primary)]">{question}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 flex gap-2 flex-col sm:flex-row">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      // Use testSessionId from quickTest if available
                                      const sessionTestId = message.quickTest?.testSessionId;
                                      if (sessionTestId) {
                                        
                                        setQuickTestSession({
                                          isActive: true,
                                          testSessionId: sessionTestId,
                                          title: message.quickTest.titleAr,
                                          currentQuestion: message.quickTest.questionsAr?.[0],
                                          currentQuestionIndex: 0,
                                          totalQuestions: message.quickTest.questionsAr?.length || 4,
                                          isComplete: false,
                                          result: null,
                                        });
                                      } else {
                                        handleStartQuickTest(message.text.substring(0, 200));
                                      }
                                    }}
                                    disabled={quickTestLoading}
                                    className={`flex-1 px-4 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-lg transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                                      quickTestLoading 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:shadow-lg hover:scale-105'
                                    }`}
                                  >
                                    {quickTestLoading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        <span>جاري البدء...</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="fas fa-play"></i>
                                        <span>ابدأ التقييم التفاعلي</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      inputRef.current?.focus();
                                    }}
                                    className="flex-1 px-4 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-all text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                                  >
                                    <i className="fas fa-comment"></i>
                                    الإجابة في المحادثة
                                  </button>
                                </div>
                                <p className="mt-3 text-xs text-[var(--text-secondary)] italic">
                                  💬 يمكنك الإجابة على هذه الأسئلة هنا أو البدء بالتقييم التفاعلي
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    <span className={`text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 block opacity-60 ${
                      message.sender === 'user' ? 'text-white' : 'text-[var(--text-secondary)]'
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
                    <div className="flex space-x-1 sm:space-x-1.5 space-x-reverse">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]/30 flex-shrink-0">
            <div className="flex gap-2 sm:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 min-w-0 px-3 sm:px-5 py-3 sm:py-4 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-lg sm:rounded-xl focus:border-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all text-[var(--text-primary)] placeholder-[var(--text-secondary)] text-sm sm:text-base"
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

      {/* Disclaimer */}
      <footer className="bg-[var(--bg-secondary)]/80 backdrop-blur-md border-t border-[var(--border-color)]/30 py-2 sm:py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <p className="text-center text-[10px] sm:text-[11px] text-[var(--text-secondary)] leading-relaxed">
            ⚠️ <strong>تنبيه:</strong> هذا المساعد يقدم دعمًا أوليًا فقط ولا يغني عن الاستشارة المتخصصة. 
            في حالات الطوارئ، يرجى التواصل مع الخدمات الطارئة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatbotPage;
