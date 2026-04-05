import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import BookCard from '../components/books/BookCard.jsx';
import { booksAPI } from '../services/communityApi.js';

const BooksPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { error: showError } = useToast();

  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const loadFeaturedBooks = useCallback(async () => {
    try {
      const data = await booksAPI.getFeatured(6);
      setFeaturedBooks(Array.isArray(data) ? data : []);
    } catch { setFeaturedBooks([]); }
  }, []);

  const loadBooks = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 12, excludeFeatured: 'true' };
      if (searchTerm) params.search = searchTerm;

      const data = await booksAPI.getAll(params);
      const booksArray = Array.isArray(data) ? data : (data?.books || []);
      setBooks(booksArray);
      setPagination({
        currentPage: data?.currentPage || 1,
        totalPages: data?.totalPages || 1,
        total: data?.total || 0,
      });
    } catch (error) {
      showError('حدث خطأ أثناء تحميل الكتب');
    } finally { setLoading(false); }
  }, [searchTerm, showError]);

  useEffect(() => { loadFeaturedBooks(); }, [loadFeaturedBooks]);

  useEffect(() => {
    setLoading(true);
    loadBooks(1);
  }, [searchTerm, loadBooks]);

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              <i className="fas fa-book-open text-[var(--primary-color)] ml-2"></i>
              الكتب
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              مجموعة مختارة من أفضل الكتب في الصحة النفسية وتطوير الذات
            </p>
            {isAuthenticated && user?.role === 'admin' && (
              <button onClick={() => navigate('/books/manage')}
                className="mt-6 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 mx-auto">
                <i className="fas fa-plus"></i>أضف كتاباً
              </button>
            )}
          </div>
        </AnimatedItem>

        {/* Featured */}
        {featuredBooks.length > 0 && (
          <AnimatedItem type="slideUp" delay={0.15}>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-6 text-right flex items-center gap-2">
                <i className="fas fa-star text-yellow-500"></i>كتب مميزة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredBooks.map((book, index) => (
                  <AnimatedItem key={book._id} type="slideUp" delay={index * 0.05}>
                    <BookCard book={book} />
                  </AnimatedItem>
                ))}
              </div>
            </div>
          </AnimatedItem>
        )}

        {/* Search */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن كتاب أو مؤلف..."
                className="w-full px-5 py-3 pr-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors" />
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"></i>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        ) : books.length === 0 ? (
          <AnimatedItem type="slideUp" delay={0.3}>
            <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
              <i className="fas fa-book text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {searchTerm ? `لا توجد نتائج لـ "${searchTerm}"` : 'لا توجد كتب بعد'}
              </h3>
              <p className="text-[var(--text-secondary)]">
                {searchTerm ? 'جرب البحث بكلمات أخرى' : 'تابعنا للحصول على كتب جديدة قريباً'}
              </p>
            </div>
          </AnimatedItem>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {books.map((book, index) => (
                <AnimatedItem key={book._id} type="slideUp" delay={index * 0.05}>
                  <BookCard book={book} />
                </AnimatedItem>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <AnimatedItem type="slideUp" delay={0.4}>
                <div className="flex justify-center gap-4">
                  <button onClick={() => { loadBooks(pagination.currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={pagination.currentPage === 1}
                    className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <i className="fas fa-chevron-right ml-2"></i>السابق
                  </button>
                  <span className="px-6 py-3 text-[var(--text-secondary)]">صفحة {pagination.currentPage} من {pagination.totalPages}</span>
                  <button onClick={() => { loadBooks(pagination.currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-6 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    التالي<i className="fas fa-chevron-left mr-2"></i>
                  </button>
                </div>
              </AnimatedItem>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
