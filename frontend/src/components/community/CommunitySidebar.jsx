import React from 'react';

const CommunitySidebar = ({ categories, selectedCategory, onSelectCategory, onClearFilters }) => {
  return (
    <div className="space-y-6">
      {/* Categories Card */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-folder text-[var(--primary-color)]"></i>
          الأقسام
        </h3>

        <div className="space-y-2">
          {/* All Categories */}
          <button
            onClick={onClearFilters}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
              !selectedCategory
                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span className="font-medium">جميع المنشورات</span>
            <i className="fas fa-th"></i>
          </button>

          {/* Category List */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => onSelectCategory(category._id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                selectedCategory === category._id
                  ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                {category.icon && <i className={`fas ${category.icon}`} style={{ color: category.color }}></i>}
                <span className="font-medium">{category.nameAr}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

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

      {/* Trending Tags Card */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-fire text-red-500"></i>
          منشورات شائعة
        </h3>

        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
            #القلق
          </span>
          <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
            #الاكتئاب
          </span>
          <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
            #العلاج
          </span>
          <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
            #العناية_بالذات
          </span>
          <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs rounded-full">
            #الدعم
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommunitySidebar;
