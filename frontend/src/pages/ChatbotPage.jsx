import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً! أنا مساعد وعي الذكي، مساعدك الافتراضي في منصة وعي. أنا هنا لتقديم المعلومات والدعم الأولي. كيف يمكنني مساعدتك اليوم؟', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const newBotMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const getBotResponse = (userMessage) => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('مرحبا') || lowerCaseMessage.includes('السلام') || lowerCaseMessage.includes('هلا')) {
      return 'السلام عليكم ورحمة الله وبركاته! كيف يمكنني مساعدتك اليوم؟';
    } else if (lowerCaseMessage.includes('psychiatric') || lowerCaseMessage.includes('نفسي') || lowerCaseMessage.includes('忧郁') || lowerCaseMessage.includes('قلق')) {
      return 'أنا هنا للاستماع إليك. إذا كنت تشعر بأعراض نفسية، أنصحك بالتحدث إلى متخصص. هل ترغب في معرفة موارد الدعم المتاحة؟';
    } else if (lowerCaseMessage.includes('شكر') || lowerCaseMessage.includes('بخير')) {
      return 'أنا سعيد لسماع ذلك! هل هناك شيء آخر يمكنني مساعدتك به؟';
    } else if (lowerCaseMessage.includes('اسمك') || lowerCaseMessage.includes('من أنت')) {
      return 'أنا مساعد وعي الذكي، مساعدك الافتراضي في منصة وعي. أنا هنا لتقديم المعلومات والدعم النفسي الأولي.';
    } else if (lowerCaseMessage.includes('وداعا') || lowerCaseMessage.includes('مع السلامة')) {
      return 'مع السلامة! لا تتردد في العودة إذا كنت بحاجة إلى أي مساعدة.';
    } else {
      return 'أشكرك على مشاركتك معي. إذا كانت لديك مشكلة نفسية أو نفسية، أنصحك بالتحدث إلى متخصص. هل ترغب في معرفة موارد الدعم المتاحة؟';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">مساعد وعي الذكي</h1>
          <p className="text-xl text-[var(--text-secondary)]">مساعدك الافتراضي في منصة وعي لتقديم الدعم النفسي الأولي</p>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden">
            <div className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">مساعد وعي الذكي</h2>
                  <p className="text-sm opacity-80">متاح على مدار الساعة</p>
                </div>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto p-6 bg-[var(--bg-primary)]">
              {messages.map(message => (
                <div key={message.id} className={`flex mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl ${message.sender === 'user' ? 'bg-[var(--primary-color)] text-white rounded-tr-none' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none shadow-sm border border-[var(--border-color)]'}`}>
                    <p className="text-right">{message.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start mb-6">
                  <div className="max-w-xs lg:max-w-md px-5 py-3 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-none shadow-sm border border-[var(--border-color)]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-[var(--text-secondary)] rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
              <div className="flex gap-4">
                <button className="w-12 h-12 flex items-center justify-center bg-[var(--bg-primary)] rounded-full text-[var(--primary-color)] hover:bg-[var(--bg-secondary)] transition-colors">
                  <i className="fas fa-microphone"></i>
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="السؤال"
                    className="w-full px-6 py-4 pr-16 border-2 border-[var(--border-color)] rounded-xl focus:border-[#c5a98e] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--primary-color)] hover:text-[var(--primary-hover)] transition-colors"
                  >
                    <i className="fas fa-paper-plane text-lg"></i>
                  </button>
                </div>

                <button className="w-12 h-12 flex items-center justify-center bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--primary-hover)] transition-colors">
                  <i className="fas fa-plus"></i>
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <button className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2">
                  <i className="fas fa-heart"></i> الدعم العاطفي
                </button>
                <button className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2">
                  <i className="fas fa-book"></i> المعلومات
                </button>
                <button className="px-4 py-2 bg-[var(--bg-primary)] text-[var(--primary-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2">
                  <i className="fas fa-question-circle"></i> الأسئلة
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">متاح على مدار الساعة</h3>
              <p className="text-[var(--text-secondary)]">يمكنك التحدث إلى مساعد وعي الذكي في أي وقت تناسبك</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">آمن وموثوق</h3>
              <p className="text-[var(--text-secondary)]">جميع المحادثات مشفرة ومحمية وفق أعلى معايير الأمان</p>
            </div>

            <div className="bg-[var(--bg-secondary)] p-8 rounded-xl shadow-lg text-center border border-[var(--border-color)]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">مبني على الأبحاث</h3>
              <p className="text-[var(--text-secondary)]">يستخدم مساعد وعي الذكي معلومات مبنية على الأبحاث العلمية الحديثة</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">مستعد للتحدث مع مساعد وعي الذكي؟</h2>
          <p className="text-xl mb-10 opacity-90">ابدأ محادثتك الآن واحصل على الدعم النفسي الأولي</p>
          <Link to="/categories" className="inline-block px-8 py-4 bg-white text-[var(--primary-color)] rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
            <i className="fas fa-robot ml-2"></i> ابدأ المحادثة
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ChatbotPage;