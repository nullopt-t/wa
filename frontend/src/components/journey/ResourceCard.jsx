import React from 'react';
import { motion } from 'framer-motion';

const ResourceCard = ({
  resource,
  title,
  isCompleted,
  onToggleComplete,
  onNavigate,
  isLoading,
}) => {
  const getResourceIcon = () => {
    switch (resource.resourceType) {
      case 'article': return 'fa-file-alt';
      case 'video': return 'fa-video';
      case 'book': return 'fa-book';
      default: return 'fa-file';
    }
  };

  const getResourceColor = () => {
    switch (resource.resourceType) {
      case 'article': return '#3B82F6';
      case 'video': return '#EF4444';
      case 'book': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getResourceLabel = () => {
    switch (resource.resourceType) {
      case 'article': return 'مقال';
      case 'video': return 'فيديو';
      case 'book': return 'كتاب';
      default: return 'مورد';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative p-4 rounded-xl border transition-all duration-300
        ${isCompleted
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-[var(--border-color)]/30 bg-[var(--bg-secondary)]'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: getResourceColor() }}
        >
          <i className={`fas ${getResourceIcon()} text-white text-lg`}></i>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Title */}
              {title ? (
                <h4 className="font-bold text-[var(--text-primary)] mb-1 truncate">
                  {title}
                </h4>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[var(--text-secondary)] text-sm">
                    {getResourceLabel()}
                  </span>
                  {isLoading ? (
                    <span className="text-xs text-[var(--text-secondary)] opacity-50">جاري التحميل...</span>
                  ) : (
                    <span className="text-xs text-red-400">لم يتم ربط مورد</span>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getResourceColor()}20`,
                    color: getResourceColor(),
                  }}
                >
                  {getResourceLabel()}
                </span>
                {resource.isMandatory && (
                  <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
                    مطلوب
                  </span>
                )}
              </div>
            </div>

            {/* View Button */}
            {onNavigate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate();
                }}
                className="px-3 py-1.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-lg text-xs font-medium hover:bg-[var(--primary-color)]/20 transition-colors flex-shrink-0"
              >
                <i className="fas fa-external-link-alt ml-1"></i>
                عرض
              </button>
            )}

            {/* Checkbox */}
            {onToggleComplete && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(resource);
                }}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${isCompleted
                    ? 'bg-green-500 border-green-500'
                    : 'border-[var(--border-color)] hover:border-[var(--primary-color)]'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                title={isCompleted ? 'مكتمل' : 'تحديد كمكتمل'}
              >
                {isCompleted && (
                  <i className="fas fa-check text-white text-sm"></i>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
