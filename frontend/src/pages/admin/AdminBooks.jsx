import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import BookForm from '../../components/books/BookForm.jsx';
import { booksAPI } from '../../services/communityApi.js';

const AdminBooks = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, featured: 0 });

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await booksAPI.getAllForAdmin({ limit: 100 });
      const list = data.books || data.data || data;
      const booksList = Array.isArray(list) ? list : [];
      setBooks(booksList);
      setStats({
        total: booksList.length,
        active: booksList.filter(b => b.isActive).length,
        inactive: booksList.filter(b => !b.isActive).length,
        featured: booksList.filter(b => b.isFeatured).length,
      });
    } catch { showError('فشل تحميل الكتب'); setBooks([]); }
    finally { setLoading(false); }
  }, [showError]);

  const handleDeleteClick = (book) => { setBookToDelete(book); setShowDeleteConfirm(true); };

  const handleDeleteConfirm = async () => {
    try {
      await booksAPI.delete(bookToDelete._id);
      success('تم حذف الكتاب بنجاح');
      setShowDeleteConfirm(false); setBookToDelete(null); loadBooks();
    } catch { showError('فشل حذف الكتاب'); }
  };

  const handleCloseModal = () => { setShowEditModal(false); setEditingBook(null); };

  const handleFormSuccess = () => {
    success(editingBook ? 'تم التحديث' : 'تم الإضافة');
    handleCloseModal(); loadBooks();
  };

  const toggleActive = async (book) => {
    try {
      await booksAPI.update(book._id, { isActive: !book.isActive });
      success(`تم ${book.isActive ? 'إخفاء' : 'تفعيل'} الكتاب`);
      loadBooks();
    } catch { showError('فشل التحديث'); }
  };

  const toggleFeatured = async (book) => {
    try {
      await booksAPI.update(book._id, { isFeatured: !book.isFeatured });
      success(`تم ${book.isFeatured ? 'إزالة' : 'إضافة'} التميز`);
      loadBooks();
    } catch { showError('فشل التحديث'); }
  };

  const filteredBooks = books.filter(book => {
    if (filterStatus === 'active' && !book.isActive) return false;
    if (filterStatus === 'inactive' && book.isActive) return false;
    if (filterStatus === 'featured' && !book.isFeatured) return false;
    return true;
  });

  return (
    <AdminLayout title="إدارة الكتب">
      {/* Stats */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--border-color)]/30 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
            <p className="text-sm text-[var(--text-secondary)]">إجمالي</p>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--border-color)]/30 text-center">
            <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            <p className="text-sm text-[var(--text-secondary)]">نشط</p>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--border-color)]/30 text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
            <p className="text-sm text-[var(--text-secondary)]">غير نشط</p>
          </div>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--border-color)]/30 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.featured}</p>
            <p className="text-sm text-[var(--text-secondary)]">مميز</p>
          </div>
        </div>
      </AnimatedItem>

      {/* Filters */}
      <AnimatedItem type="slideUp" delay={0.15}>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'الكل', icon: 'fa-list' },
            { id: 'active', label: 'نشط', icon: 'fa-check-circle' },
            { id: 'inactive', label: 'غير نشط', icon: 'fa-times-circle' },
            { id: 'featured', label: 'مميز', icon: 'fa-star' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilterStatus(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                filterStatus === f.id ? 'bg-[var(--primary-color)] text-white shadow-lg' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}>
              <i className={`fas ${f.icon}`}></i><span>{f.label}</span>
            </button>
          ))}
          <div className="flex-grow"></div>
          <button onClick={() => { setEditingBook(null); setShowEditModal(true); }}
            className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
            <i className="fas fa-plus"></i>أضف كتاباً
          </button>
        </div>
      </AnimatedItem>

      {/* Table */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الكتاب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">المؤلف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الملف</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">مميز</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)] mx-auto"></div></td></tr>
                ) : filteredBooks.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-[var(--text-secondary)]">لا توجد كتب</td></tr>
                ) : (
                  filteredBooks.map((book) => (
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
                            <a href={`/books/${book.slug || book._id}`} target="_blank" rel="noopener noreferrer"
                              className="font-medium text-[var(--primary-color)] hover:underline text-sm block mb-1">{book.title}</a>
                            <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">{book.description?.substring(0, 60)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">{book.author}</td>
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
                        <button onClick={() => toggleActive(book)}
                          className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                            book.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                          }`}>{book.isActive ? 'نشط' : 'غير نشط'}</button>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleFeatured(book)} className="cursor-pointer transition-colors">
                          <i className={`fas fa-star ${book.isFeatured ? 'text-yellow-500' : 'text-[var(--text-secondary)]/30'}`}></i>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingBook(book); setShowEditModal(true); }}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedItem>

      <ConfirmDialog
        isOpen={showDeleteConfirm} title="حذف الكتاب"
        message={`هل أنت متأكد من حذف كتاب "${bookToDelete?.title}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف" cancelText="إلغاء" isDanger={true}
        onConfirm={handleDeleteConfirm} onCancel={() => { setShowDeleteConfirm(false); setBookToDelete(null); }}
      />

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">{editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}</h2>
              <button onClick={handleCloseModal} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6">
              <BookForm book={editingBook} onSuccess={handleFormSuccess} onCancel={handleCloseModal} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBooks;
