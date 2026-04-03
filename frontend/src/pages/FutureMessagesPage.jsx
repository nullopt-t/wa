import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { futureMessagesAPI } from '../services/communityApi.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';

const FutureMessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { error: showError, success } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'delivered'
  const [editingMessage, setEditingMessage] = useState(null);
  const [viewingMessage, setViewingMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countdowns, setCountdowns] = useState({});
  const countdownRef = useRef(null);

  // Auto-open message from URL (?view=MESSAGE_ID) - triggered by notification link
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && messages.length > 0) {
      // Clear from URL
      setSearchParams({}, { replace: true });
      // Open modal
      const msg = messages.find(m => m._id === viewId);
      if (msg) {
        setViewingMessage(msg);
      }
    }
  }, [searchParams, messages, setSearchParams]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await futureMessagesAPI.getAll(true); // Always load ALL messages including delivered
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Update countdowns every second
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date();
      const newCountdowns = {};

      messages.forEach(msg => {
        if (!msg.isDelivered) {
          const deliver = new Date(msg.deliverAt);
          const diff = deliver - now;

          if (diff <= 0) {
            newCountdowns[msg._id] = { text: 'جاهزة للتسليم', color: 'text-yellow-400', icon: 'fa-bell' };
          } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
              newCountdowns[msg._id] = {
                text: `${days}يوم ${hours}ساعة`,
                color: 'text-blue-400',
                icon: 'fa-clock'
              };
            } else if (hours > 0) {
              newCountdowns[msg._id] = {
                text: `${hours}ساعة ${minutes}دقيقة`,
                color: 'text-cyan-400',
                icon: 'fa-hourglass-half'
              };
            } else {
              newCountdowns[msg._id] = {
                text: `${minutes}دقيقة ${seconds}ثانية`,
                color: 'text-green-400',
                icon: 'fa-stopwatch'
              };
            }
          }
        }
      });

      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    countdownRef.current = setInterval(updateCountdowns, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [messages]);

  // Auto-refresh every 30s to catch cron-delivered messages
  useEffect(() => {
    const refreshInterval = setInterval(loadMessages, 30000);
    return () => clearInterval(refreshInterval);
  }, [loadMessages]);

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;

    try {
      await futureMessagesAPI.delete(messageToDelete._id);
      success('تم حذف الرسالة بنجاح');
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
      loadMessages();
    } catch (error) {
      showError('فشل حذف الرسالة');
    }
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message.message);
    success('تم نسخ الرسالة');
  };

  const filteredMessages = messages.filter(msg => {
    // Filter by status
    if (filter === 'pending' && msg.isDelivered) return false;
    if (filter === 'delivered' && !msg.isDelivered) return false;

    // Filter by search (combined with status)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return msg.title?.toLowerCase().includes(search) ||
             msg.message?.toLowerCase().includes(search);
    }

    return true;
  });

  const stats = {
    total: messages.length,
    pending: messages.filter(m => !m.isDelivered).length,
    delivered: messages.filter(m => m.isDelivered).length,
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--primary-color)]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--secondary-color)]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Hero Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-3">
                  <span className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-envelope text-white text-xl"></i>
                  </span>
                  رسائل المستقبل
                </h1>
                <p className="text-[var(--text-secondary)] text-lg">
                  ارسل رسائل إلى مستقبلك، واقرأها عندما يحين الوقت
                </p>
              </div>
              <button
                onClick={() => navigate('/future-messages/create')}
                className="px-8 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-[var(--primary-color)]/25 transition-all hover:scale-105 flex items-center gap-3 self-start"
              >
                <i className="fas fa-pen-fancy text-xl"></i>
                <span>رسالة جديدة</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-hourglass-half text-blue-400"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{stats.pending}</div>
                    <div className="text-xs text-blue-300/70">قيد الانتظار</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-md rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{stats.delivered}</div>
                    <div className="text-xs text-green-300/70">مُسلمة</div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-md rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <i className="fas fa-inbox text-purple-400"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{stats.total}</div>
                    <div className="text-xs text-purple-300/70">المجموع</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Filters and Search */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-4 mb-6 border border-[var(--border-color)]/30">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl">
                {[
                  { id: 'all', label: 'الكل', icon: 'fa-layer-group' },
                  { id: 'pending', label: 'قيد الانتظار', icon: 'fa-clock' },
                  { id: 'delivered', label: 'مُسلمة', icon: 'fa-check-circle' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      filter === tab.id
                        ? 'bg-[var(--primary-color)] text-white shadow-lg'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <i className={`fas ${tab.icon}`}></i>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-md">
                <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"></i>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث في رسائلك..."
                  className="w-full pr-12 pl-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all"
                />
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Messages Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-3xl p-16 text-center border border-[var(--border-color)]/30">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[var(--primary-color)]/20 to-[var(--secondary-color)]/20 rounded-full flex items-center justify-center">
                <i className="fas fa-inbox text-5xl text-[var(--primary-color)]"></i>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                {searchTerm ? 'لا توجد رسائل مطابقة' : 'لا توجد رسائل بعد'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                {searchTerm
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ابدأ رحلتك بكتابة رسالة إلى مستقبلك. ماذا تريد أن تقول لنفسك بعد شهر؟ بعد سنة؟'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/future-messages/create')}
                  className="px-8 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-2xl font-semibold hover:shadow-xl hover:shadow-[var(--primary-color)]/25 transition-all hover:scale-105 inline-flex items-center gap-3"
                >
                  <i className="fas fa-pen-fancy"></i>
                  اكتب رسالتك الأولى
                </button>
              )}
            </div>
          </AnimatedItem>
        ) : (
          <AnimatedItem type="slideUp" delay={0.4}>
            <div className="grid gap-6 md:grid-cols-2">
              {filteredMessages.map((message, index) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  countdown={countdowns[message._id]}
                  onEdit={() => setEditingMessage(message)}
                  onDelete={() => handleDeleteClick(message)}
                  onCopy={() => handleCopyMessage(message)}
                  onView={() => setViewingMessage(message)}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </AnimatedItem>
        )}
      </div>

      {/* Edit Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onSave={() => {
            setEditingMessage(null);
            loadMessages();
          }}
          onError={showError}
        />
      )}

      {/* View Message Modal */}
      {viewingMessage && (
        <ViewMessageModal
          message={viewingMessage}
          onClose={() => setViewingMessage(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف الرسالة"
        message="هل أنت متأكد من حذف هذه الرسالة؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setMessageToDelete(null);
        }}
      />
    </div>
  );
};

// Message Card
const MessageCard = ({ message, countdown, onEdit, onDelete, onCopy, delay, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isDelivered = message.isDelivered;
  const isReady = !isDelivered && new Date(message.deliverAt) <= new Date();

  const statusConfig = {
    delivered: { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/30', badge: 'bg-green-500 text-white', icon: 'fa-check-circle' },
    ready: { bg: 'from-yellow-500/10 to-orange-500/10', border: 'border-yellow-500/30', badge: 'bg-yellow-500 text-white', icon: 'fa-bell' },
    pending: { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500 text-white', icon: 'fa-clock' },
  };

  const config = isDelivered ? statusConfig.delivered : isReady ? statusConfig.ready : statusConfig.pending;

  return (
    <AnimatedItem type="scaleIn" delay={delay}>
      <div className={`group relative bg-gradient-to-br ${config.bg} backdrop-blur-md rounded-3xl border ${config.border} overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-xl font-bold text-[var(--text-primary)] line-clamp-1">
                  {message.title || 'بدون عنوان'}
                </h3>
                <span className={`${config.badge} px-3 py-1 text-xs rounded-full font-medium flex items-center gap-1`}>
                  <i className={`fas ${config.icon}`}></i>
                  {isDelivered ? 'مُسلمة' : isReady ? 'جاهزة' : 'مجدولة'}
                </span>
              </div>
              {!isDelivered && countdown && (
                <div className={`flex items-center gap-2 text-sm ${countdown.color}`}>
                  <i className={`fas ${countdown.icon} animate-pulse`}></i>
                  <span className="font-medium">{countdown.text}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isDelivered && (
                <>
                  <button onClick={onEdit} className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-all hover:scale-110" title="تعديل">
                    <i className="fas fa-pen"></i>
                  </button>
                  <button onClick={onDelete} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all hover:scale-110" title="حذف">
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
              {isDelivered && (
                <>
                  <button onClick={onView} className="p-2.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-color)]/20 transition-all hover:scale-110" title="عرض">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button onClick={onCopy} className="p-2.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-color)]/20 transition-all hover:scale-110" title="نسخ">
                    <i className="fas fa-copy"></i>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative mb-4">
            <div className={`bg-[var(--card-bg)]/50 backdrop-blur-sm rounded-2xl p-4 border border-[var(--border-color)]/20 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
              <p className="text-[var(--text-primary)] leading-relaxed text-sm whitespace-pre-wrap">
                {message.message}
              </p>
            </div>
            {message.message.length > 150 && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="mt-2 text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1 transition-colors">
                {isExpanded ? <><i className="fas fa-chevron-up"></i> طي الرسالة</> : <><i className="fas fa-chevron-down"></i> عرض المزيد</>}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-color)]/20 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <i className="far fa-calendar"></i>
              <span>{new Date(message.deliverAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="far fa-clock"></i>
              <span>{new Date(message.deliverAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {message.isEmailNotification && (
              <div className="flex items-center gap-2 text-[var(--primary-color)]">
                <i className="far fa-envelope"></i>
                <span>إشعار بالبريد الإلكتروني</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
};

// Edit Modal Component
const EditMessageModal = ({ message, onClose, onSave, onError }) => {
  const [formData, setFormData] = useState({
    title: message.title || '',
    message: message.message,
    deliverAt: new Date(message.deliverAt).toISOString().slice(0, 16),
    isEmailNotification: message.isEmailNotification || false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب';
    if (!formData.message.trim()) newErrors.message = 'الرسالة مطلوبة';
    if (!formData.deliverAt) newErrors.deliverAt = 'تاريخ التسليم مطلوب';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await futureMessagesAPI.update(message._id, {
        title: formData.title,
        message: formData.message,
        deliverAt: formData.deliverAt,
        isEmailNotification: formData.isEmailNotification,
      });
      onSave();
    } catch (error) {
      onError(error.message || 'فشل تحديث الرسالة');
    } finally {
      setLoading(false);
    }
  };

  // Calculate min date (1 min from now in local time for datetime-local)
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  const minDate = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + 'T' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-3xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center">
              <i className="fas fa-pen text-white"></i>
            </span>
            تعديل الرسالة
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">العنوان</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => { setFormData(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })); }}
              className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-all ${errors.title ? 'border-red-500' : 'border-[var(--border-color)]'}`}
              placeholder="عنوان الرسالة..."
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">المحتوى</label>
            <textarea
              value={formData.message}
              onChange={(e) => { setFormData(p => ({ ...p, message: e.target.value })); setErrors(p => ({ ...p, message: '' })); }}
              rows="6"
              className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-all resize-none ${errors.message ? 'border-red-500' : 'border-[var(--border-color)]'}`}
              placeholder="اكتب رسالتك إلى مستقبلك..."
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">موعد التسليم</label>
            <input
              type="datetime-local"
              value={formData.deliverAt}
              onChange={(e) => { setFormData(p => ({ ...p, deliverAt: e.target.value })); setErrors(p => ({ ...p, deliverAt: '' })); }}
              min={minDate}
              className={`w-full px-4 py-3 bg-[var(--bg-secondary)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-all ${errors.deliverAt ? 'border-red-500' : 'border-[var(--border-color)]'}`}
            />
            {errors.deliverAt && <p className="text-red-500 text-sm mt-1">{errors.deliverAt}</p>}
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEmailNotification}
                onChange={(e) => setFormData(p => ({ ...p, isEmailNotification: e.target.checked }))}
                className="w-5 h-5 rounded"
              />
              <span className="text-[var(--text-primary)] font-medium">إرسال إشعار عبر البريد الإلكتروني عند التسليم</span>
            </label>
            <p className="text-xs text-[var(--text-secondary)] mt-2 ml-8">سيتم الإرسال إلى بريدك الإلكتروني المسجل</p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> جاري الحفظ...</> : <><i className="fas fa-check"></i> حفظ التعديلات</>}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--bg-primary)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Message Modal (Read-only)
const ViewMessageModal = ({ message, onClose }) => {
  const isDelivered = message.isDelivered;
  const deliverDate = new Date(message.deliverAt);
  const createdAt = message.createdAt ? new Date(message.createdAt) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-3xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <i className="fas fa-envelope-open-text text-white"></i>
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{message.title || 'بدون عنوان'}</h2>
              <span className="text-xs text-green-500 flex items-center gap-1">
                <i className="fas fa-check-circle"></i> مُسلَّمة
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message Content */}
          <div>
            <label className="text-sm text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <i className="fas fa-comment text-[var(--primary-color)]"></i>
              محتوى الرسالة
            </label>
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-color)]/20">
              <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <label className="text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <i className="fas fa-calendar-plus text-[var(--primary-color)]"></i>
                تاريخ الإنشاء
              </label>
              <p className="text-[var(--text-primary)] font-medium">
                {createdAt ? createdAt.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
              </p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
              <label className="text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-2">
                <i className="fas fa-calendar-check text-[var(--primary-color)]"></i>
                موعد التسليم
              </label>
              <p className="text-[var(--text-primary)] font-medium">
                {deliverDate.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]/20">
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.message);
              }}
              className="flex-1 px-4 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-copy"></i> نسخ الرسالة
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--bg-primary)] transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureMessagesPage;
