import React from 'react';
import AnimatedItem from '../AnimatedItem.jsx';

/**
 * Reusable Filter Component for Admin Pages
 * @param {string} searchTerm - Current search term
 * @param {function} onSearchChange - Search change handler
 * @param {string} searchPlaceholder - Search input placeholder
 * @param {array} filters - Array of filter objects {key, label, value, options: [{value, label}]}
 * @param {function} onFilterChange - Filter change handler
 * @param {function} onClearFilters - Clear all filters handler
 * @param {number} totalItems - Total items count
 * @param {number} filteredItems - Filtered items count
 */
const AdminFilters = ({
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters = [],
  onFilterChange,
  onClearFilters,
  totalItems = 0,
  filteredItems = 0,
}) => {
  const hasActiveFilters = searchTerm || filters.some(f => f.value !== 'all');

  return (
    <AnimatedItem type="slideUp" delay={0.1}>
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-6">
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(filters.length + 1, 4)} gap-4`}>
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              بحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Results Counter & Clear Button */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-[var(--text-secondary)]">
            عرض {filteredItems} من {totalItems} {totalItems === 1 ? 'عنصر' : 'عنصر'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-[var(--primary-color)] hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>
    </AnimatedItem>
  );
};

export default AdminFilters;
