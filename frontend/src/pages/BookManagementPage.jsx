import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { booksAPI } from '../services/communityApi.js';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import BookForm from '../components/books/BookForm.jsx';

const BookManagementPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadBooks();
  }, [isAuthenticated]);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await booksAPI.getAllForAdmin({ limit: 50 });
      const list = data.books || data.data || data;
      setBooks(Array.isArray(list) ? list : []);
    } catch { showError('حدث خطأ أثناء تحميل الكتب'); setBooks([]); }
    finally { setLoading(false); }
  }, [showError]);

  const handleDeleteClick = (book) => { setBookToDelete(book); setShowDeleteConfirm(true); };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    try {
      await booksAPI.delete(bookToDelete._id);
      success('تم حذف الكتاب بنجاح');
      setShowDeleteConfirm(false);
      setBookToDelete(null);
      loadBooks();
    } catch { showError('فشل حذف الكتاب'); }
  };

  const filteredBooks = books.filter(book => {
    if (book.isFeatured) return true;
    if (book.isActive) return true;
    return true; // show all
  });

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">إدارة الكتب</h1>
              <p className="text-[var(--text-secondary)]">أضف وأدر الكتب المقترحة</p>
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
              <i className="fas fa-plus"></i>كتاب جديد
            </button>
          </div>
        </AnimatedItem>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : !books || books.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.2}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
              <i className="fas fa-book text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد كتب بعد</h3>
              <button onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors">
                <i className="fas fa-plus ml-2"></i>إضافة كتاب
              </button>
            </div>
          </AnimatedItem>
        ) : (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-secondary)]">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الكتاب</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">المؤلف</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الصفحات</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الملف</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">مميز</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {filteredBooks.map((book) => (
                      <tr key={book._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-[var(--bg-secondary)] rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {book.coverImage ? (
                                <img src={book.coverImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <i className="fas fa-book text-[var(--primary-color)] text-xs"></i>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)] text-sm">{book.title}</p>
                              <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">{book.description?.substring(0, 50)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{book.author}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{book.pages || '-'}</td>
                        <td className="px-6 py-4">
                          {book.fileUrl ? (
                            <a href={book.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[var(--primary-color)] hover:underline text-sm flex items-center gap-1">
                              <i className="fas fa-file-pdf"></i>متوفر
                            </a>
                          ) : (
                            <span className="text-[var(--text-secondary)]/40 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${book.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                            {book.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {book.isFeatured ? <i className="fas fa-star text-yellow-500"></i> : <i className="far fa-star text-[var(--text-secondary)]"></i>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingBook(book)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="تعديل">
                              <i className="fas fa-pen"></i>
                            </button>
                            <button onClick={() => handleDeleteClick(book)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="حذف">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm} title="حذف الكتاب"
        message="هل أنت متأكد من حذف هذا الكتاب؟\n\nهذا الإجراء لا يمكن التراجع عنه."
        confirmText="حذف" cancelText="إلغاء" isDanger={true}
        onConfirm={handleDeleteConfirm} onCancel={() => { setShowDeleteConfirm(false); setBookToDelete(null); }}
      />

      {(showAddModal || editingBook) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setEditingBook(null); }}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</h2>
              <button onClick={() => { setShowAddModal(false); setEditingBook(null); }}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <BookForm
                book={editingBook}
                onSuccess={() => { setShowAddModal(false); setEditingBook(null); success(editingBook ? 'تم التحديث' : 'تم الإضافة'); loadBooks(); }}
                onCancel={() => { setShowAddModal(false); setEditingBook(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagementPage;
