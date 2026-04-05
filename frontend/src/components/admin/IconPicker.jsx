import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const IconPicker = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((opt) => `fa-solid ${opt.icon}` === value);
  const filtered = options.filter(
    (opt) => opt.label.includes(search) || opt.icon.includes(search)
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setSearch('');
          setIsOpen(true);
        }}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] hover:border-[var(--primary-color)] transition-colors"
      >
        {selected ? (
          <>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-color)/10' }}>
              <i className={`fas ${selected.icon} text-base`} style={{ color: 'var(--primary-color)' }}></i>
            </div>
            <span className="flex-1 text-right">{selected.label}</span>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center">
              <i className="fas fa-icons text-[var(--text-secondary)]"></i>
            </div>
            <span className="flex-1 text-right text-[var(--text-secondary)]">اختر أيقونة...</span>
          </>
        )}
        <i className="fas fa-chevron-down text-xs text-[var(--text-secondary)]"></i>
      </button>

      {/* Modal - rendered at document.body via Portal */}
      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

          {/* Dialog */}
          <div
            className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]/30">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">اختر أيقونة</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[var(--border-color)]/30">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن أيقونة..."
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                autoFocus
              />
            </div>

            {/* Icon Grid */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {filtered.map((opt) => {
                    const isSelected = `fa-solid ${opt.icon}` === value;
                    return (
                      <button
                        key={opt.icon}
                        type="button"
                        onClick={() => {
                          onChange(`fa-solid ${opt.icon}`);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`
                          flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                          ${isSelected
                            ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 shadow-md scale-105'
                            : 'border-[var(--border-color)]/30 bg-[var(--bg-secondary)] hover:border-[var(--primary-color)]/40 hover:scale-105'
                          }
                        `}
                        title={opt.label}
                      >
                        <i
                          className={`fas ${opt.icon} text-xl mb-1`}
                          style={{
                            color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)',
                          }}
                        ></i>
                        <span className="text-xs text-[var(--text-secondary)] leading-none truncate w-full text-center">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default IconPicker;
