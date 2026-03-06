import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { futureMessagesAPI } from '../services/communityApi.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const FutureMessagesListPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { error: showError, success } = useToast();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeDelivered, setIncludeDelivered] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await futureMessagesAPI.getAll(includeDelivered);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load future messages:', error);
      showError('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  }, [includeDelivered, showError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const toggleExpand = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

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

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      await futureMessagesAPI.delete(id);
      success('تم حذف الرسالة بنجاح');
      loadMessages();
    } catch (error) {
      showError('فشل حذف الرسالة');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (deliverAt) => {
    const now = new Date();
    const deliver = new Date(deliverAt);
    const diff = deliver - now;

    if (diff <= 0) {
      return { text: 'جاهزة للتسليم', color: 'text-yellow-500' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { text: `متبقي ${days} يوم و${hours} ساعة`, color: 'text-blue-500' };
    } else if (hours > 0) {
      return { text: `متبقي ${hours} ساعة و${minutes} دقيقة`, color: 'text-blue-500' };
    } else {
      return { text: `متبقي ${minutes} دقيقة`, color: 'text-green-500' };
    }
  };

  const getStatusBadge = (message) => {
    const now = new Date();
    const deliverAt = new Date(message.deliverAt);

    if (message.isDelivered) {
      return (
        <span className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
          تم التسليم
        </span>
      );
    } else if (deliverAt <= now) {
      return (
        <span className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-full">
          جاهزة للتسليم
        </span>
      );
    } else {
      return (
        <span className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
          مجدولة
        </span>
      );
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                رسائل المستقبل
              </h1>
              <p className="text-[var(--text-secondary)]">
                رسائلك المجدولة للتسليم في المستقبل
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIncludeDelivered(!includeDelivered)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  includeDelivered
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)]/10'
                }`}
              >
                {includeDelivered ? 'إخفاء المُسلمة' : 'عرض المُسلمة'}
              </button>
              <button
                onClick={() => navigate('/future-messages/create')}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>
                رسالة جديدة
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Messages List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : messages.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
              <i className="fas fa-inbox text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {includeDelivered ? 'لا توجد رسائل' : 'لا توجد رسائل مجدولة'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {includeDelivered
                  ? 'لم تكتب أي رسائل بعد'
                  : 'ابدأ بكتابة رسالة إلى مستقبلك'}
              </p>
              <button
                onClick={() => navigate('/future-messages/create')}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-pen ml-2"></i>
                اكتب رسالة
              </button>
            </div>
          </AnimatedItem>
        ) : (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="grid gap-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl border border-[var(--border-color)]/30 overflow-hidden hover:border-[var(--primary-color)]/50 transition-all hover:shadow-lg"
                >
                  <div className="p-6">
                    {/* Header: Title + Status */}
                    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">
                          {message.title || 'بدون عنوان'}
                        </h3>
                        {getStatusBadge(message)}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!message.isDelivered && (
                          <>
                            <button
                              onClick={() => setEditingMessage(message)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(message)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                        {message.isDelivered && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(message.message);
                              success('تم نسخ الرسالة');
                            }}
                            className="p-2 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                            title="نسخ"
                          >
                            <i className="fas fa-copy"></i>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-4 overflow-hidden relative">
                      <p 
                        className={`text-[var(--text-primary)] leading-relaxed break-words max-w-full transition-all duration-300 ${
                          expandedMessages[message._id] ? '' : 'line-clamp-3'
                        }`}
                        style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto'
                        }}
                      >
                        {message.message}
                      </p>
                      {message.message.length > 200 && (
                        <button
                          onClick={() => toggleExpand(message._id)}
                          className="mt-2 text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1"
                        >
                          {expandedMessages[message._id] ? (
                            <>
                              <i className="fas fa-chevron-up"></i>
                              طي الرسالة
                            </>
                          ) : (
                            <>
                              <i className="fas fa-chevron-down"></i>
                              عرض الرسالة كاملة
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Footer: Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <i className="far fa-clock"></i>
                        <span>التسليم: <span className="font-medium text-[var(--text-primary)]">{formatDate(message.deliverAt)}</span></span>
                      </div>
                      {!message.isDelivered && (
                        <div className={`flex items-center gap-2 font-medium ${getTimeRemaining(message.deliverAt).color}`}>
                          <i className="fas fa-hourglass-half"></i>
                          <span>{getTimeRemaining(message.deliverAt).text}</span>
                        </div>
                      )}
                      {message.isDelivered && message.deliveredAt && (
                        <div className="flex items-center gap-2 text-green-500">
                          <i className="fas fa-check-circle"></i>
                          <span>سُلمت: <span className="font-medium text-[var(--text-primary)]">{formatDate(message.deliveredAt)}</span></span>
                        </div>
                      )}
                      {message.isEmailNotification && (
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <i className="far fa-envelope"></i>
                          <span>{message.recipientEmail || 'بريدك المسجل'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

// Edit Message Modal Component
const EditMessageModal = ({ message, onClose, onSave, onError }) => {
  const [formData, setFormData] = useState({
    title: message.title || '',
    message: message.message,
    deliverAt: new Date(message.deliverAt).toISOString().slice(0, 16),
    isEmailNotification: message.isEmailNotification || false,
    recipientEmail: message.recipientEmail || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة';
    } else if (formData.message.length < 10) {
      newErrors.message = 'الرسالة يجب أن تكون 10 أحرف على الأقل';
    }

    if (!formData.deliverAt) {
      newErrors.deliverAt = 'تاريخ التسليم مطلوب';
    } else {
      const deliverDate = new Date(formData.deliverAt);
      const now = new Date();
      if (deliverDate <= now) {
        newErrors.deliverAt = 'يجب أن يكون تاريخ التسليم في المستقبل';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data - don't send recipientEmail if not enabled
      const submitData = {
        title: formData.title,
        message: formData.message,
        deliverAt: formData.deliverAt,
        isEmailNotification: formData.isEmailNotification,
      };
      
      // Only include recipientEmail if email notification is enabled
      if (formData.isEmailNotification && formData.recipientEmail) {
        submitData.recipientEmail = formData.recipientEmail;
      }
      
      await futureMessagesAPI.update(message._id, submitData);
      onSave();
    } catch (error) {
      onError(error.message || 'فشل تحديث الرسالة');
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDate = now.toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">تعديل الرسالة</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              العنوان
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] ${
                errors.title ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              المحتوى
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="6"
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none ${
                errors.message ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          {/* Deliver At */}
          <div>
            <label className="block text-lg font-medium text-[var(--text-primary)] mb-2">
              موعد التسليم
            </label>
            <input
              type="datetime-local"
              name="deliverAt"
              value={formData.deliverAt}
              onChange={handleInputChange}
              min={minDate}
              className={`w-full px-4 py-3 bg-[var(--card-bg)] border rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] ${
                errors.deliverAt ? 'border-red-500' : 'border-[var(--border-color)]'
              }`}
            />
            {errors.deliverAt && <p className="text-red-500 text-sm mt-1">{errors.deliverAt}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف الرسالة"
        message="هل أنت متأكد من حذف هذه الرسالة؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default FutureMessagesListPage;
