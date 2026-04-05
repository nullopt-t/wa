import React from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book }) => {
  return (
    <Link
      to={`/books/${book.slug || book._id}`}
      className="group bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden hover:shadow-xl hover:shadow-[var(--primary-color)]/10 transition-all duration-300 hover:-translate-y-1 block h-full flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-secondary)]">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-book text-6xl text-[var(--text-secondary)]/20"></i>
          </div>
        )}
        {book.isFeatured && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <i className="fas fa-star"></i>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1 line-clamp-2 group-hover:text-[var(--primary-color)] transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-2">{book.author}</p>
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3 flex-grow">
          {book.description}
        </p>
        {book.pages && (
          <div className="pt-2 border-t border-[var(--border-color)]/20 text-xs text-[var(--text-secondary)] flex items-center gap-1">
            <i className="fas fa-file-alt"></i>
            {book.pages} صفحة
          </div>
        )}
      </div>
    </Link>
  );
};

export default BookCard;
