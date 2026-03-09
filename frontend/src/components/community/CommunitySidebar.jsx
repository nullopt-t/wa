import React from 'react';

const CommunitySidebar = ({
  selectedTag,
  onSelectTag,
  onClearTagFilter
}) => {
  return (
    <div className="space-y-6">
      {/* Active Tag Filter */}
      {selectedTag && (
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <i className="fas fa-filter text-[var(--primary-color)]"></i>
            فلتر الحالي
          </h3>
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--primary-color)]/10 rounded-xl">
            <div className="flex items-center gap-2">
              <i className="fas fa-tag text-[var(--primary-color)]"></i>
              <span className="font-medium text-[var(--primary-color)]">#{selectedTag}</span>
            </div>
            <button
              onClick={onClearTagFilter}
              className="text-[var(--primary-color)] hover:text-red-500 transition-colors"
              title="إزالة الفلتر"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Community Guidelines Card */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-book text-[var(--primary-color)]"></i>
          إرشادات المجتمع
        </h3>

        <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <span>احترم آراء الآخرين وتجاربهم</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <span>لا تشارك معلومات شخصية حساسة</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <span>التزم بالموضوعات المتعلقة بالصحة النفسية</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <span>تجنب النصائح الطبية المتخصصة</span>
          </li>
          <li className="flex items-start gap-2">
            <i className="fas fa-check-circle text-green-500 mt-1"></i>
            <span>بلغ عن المحتوى غير المناسب</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommunitySidebar;
