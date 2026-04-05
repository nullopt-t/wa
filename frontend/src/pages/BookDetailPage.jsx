import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import BookCard from '../components/books/BookCard.jsx';
import ContextualChatPrompt from '../components/ContextualChatPrompt.jsx';
import { booksAPI } from '../services/communityApi.js';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { error: showError } = useToast();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    try {
      setLoading(true);
      let data;
      try { data = await booksAPI.getBySlug(bookId); }
      catch { data = await booksAPI.getById(bookId); }
      setBook(data);

      const related = await booksAPI.getAll({ limit: 4 });
      const booksArray = Array.isArray(related) ? related : (related?.books || []);
      setRelatedBooks(booksArray.filter(b => b._id !== data._id).slice(0, 3));
    } catch {
      showError('الكتاب غير موجود');
      setTimeout(() => navigate('/books'), 2000);
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedItem type="slideUp" delay={0.1}>
          <button onClick={() => navigate('/books')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors mb-8">
            <i className="fas fa-arrow-right"></i><span>العودة للكتب</span>
          </button>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-10">
              {/* Cover */}
              <div className="md:col-span-1">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[var(--bg-secondary)] shadow-xl">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-book text-8xl text-[var(--text-secondary)]/20"></i>
                    </div>
                  )}
                </div>
                {book.isFeatured && (
                  <div className="mt-3 text-center">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm rounded-full">
                      <i className="fas fa-star ml-1"></i>مميز
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">{book.title}</h1>
                <p className="text-lg text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                  <i className="fas fa-pen-fancy text-[var(--primary-color)]"></i>{book.author}
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                    <i className="fas fa-align-right ml-2 text-[var(--primary-color)]"></i>عن الكتاب
                  </h3>
                  <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-line">{book.description}</p>
                </div>

                {book.pages && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-xl mb-6">
                    <i className="fas fa-file-alt text-[var(--primary-color)]"></i>
                    <span className="text-[var(--text-primary)]">{book.pages} صفحة</span>
                  </div>
                )}

                {book.fileUrl && (
                  <a href={book.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all mb-6">
                    <i className="fas fa-book-reader"></i>اقرأ الكتاب
                  </a>
                )}

                <div className="text-sm text-[var(--text-secondary)]">
                  <span>{book.createdAt ? new Date(book.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.4}>
          <div className="mt-12 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 text-center">
            <p className="text-[var(--text-secondary)] mb-4">عايز تعرف أكتر عن الكتاب ده؟ اسأل المساعد الذكي</p>
            <div className="flex justify-center">
              <ContextualChatPrompt message={`قريت عن كتاب "${book?.title}" - ممكن تقولي أكتر عنه؟`} icon="fa-book" text="اسأل المساعد" />
            </div>
          </div>
        </AnimatedItem>

        {relatedBooks.length > 0 && (
          <AnimatedItem type="slideUp" delay={0.5}>
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <i className="fas fa-book text-[var(--primary-color)]"></i>كتب مشابهة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBooks.map(b => <BookCard key={b._id} book={b} />)}
              </div>
            </div>
          </AnimatedItem>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
