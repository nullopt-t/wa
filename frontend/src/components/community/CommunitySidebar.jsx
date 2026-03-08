import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../../services/communityApi.js';

const CommunitySidebar = ({
  selectedTag,
  onSelectTag,
  onClearTagFilter
}) => {
  const navigate = useNavigate();
  const [trendingTags, setTrendingTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Load trending tags
  useEffect(() => {
    loadTrendingTags();
  }, []);

  const loadTrendingTags = async () => {
    try {
      setTagsLoading(true);
      const data = await postsAPI.getTrendingTags(15);
      console.log('Loaded trending tags:', data);
      setTrendingTags(data);
    } catch (error) {
      console.error('Failed to load trending tags:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    if (onSelectTag) {
      onSelectTag(tag);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending Tags Card */}
      <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <i className="fas fa-fire text-red-500"></i>
          الوسوم الشائعة
        </h3>

        {tagsLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="px-3 py-1 bg-[var(--bg-secondary)] rounded-full animate-pulse w-20 h-6"
              ></div>
            ))}
          </div>
        ) : trendingTags.length > 0 ? (
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {trendingTags.length} وسوم متاحة
            </p>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleTagClick(item.tag)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                    selectedTag === item.tag
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--primary-color)] hover:text-white'
                  }`}
                  title={`${item.count} منشورات`}
                >
                  #{item.tag}
                  <span className="text-[10px] opacity-60">({item.count})</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-[var(--text-secondary)] text-sm">
            <i className="fas fa-tag text-2xl mb-2"></i>
            <p>لا توجد وسوم شائعة حالياً</p>
          </div>
        )}
      </div>

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
