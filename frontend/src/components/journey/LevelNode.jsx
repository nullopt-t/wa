import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ProgressRing from './ProgressRing.jsx';

const LevelNode = ({
  level,
  progress,
  journeyId,
  isCompleted,
  isLocked,
  isCurrent,
  index,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLocked) return;
    navigate(`/journey/${journeyId}/level/${level.levelNumber}`);
  };

  const levelProgress = progress?.levelProgress?.find(
    (lp) => lp.levelNumber === level.levelNumber
  );

  const progressPercentage = levelProgress?.progressPercentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isLocked ? 0.4 : 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative group ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleClick}
    >
      <div
        className={`
          relative p-6 rounded-2xl border transition-all duration-300
          ${isCompleted
            ? 'border-green-500/30 bg-green-500/5 shadow-lg'
            : isCurrent
            ? 'border-[var(--primary-color)]/50 bg-[var(--card-bg)] shadow-xl'
            : isLocked
            ? 'border-[var(--border-color)]/20 bg-[var(--bg-secondary)]'
            : 'border-[var(--border-color)]/30 bg-[var(--card-bg)] hover:shadow-lg hover:border-[var(--primary-color)]/40'
          }
        `}
      >
        {/* Status Icon */}
        <div className="absolute -top-3 -right-3">
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-[var(--card-bg)]"
            >
              <i className="fas fa-check text-white text-sm"></i>
            </motion.div>
          ) : isLocked ? (
            <div className="w-8 h-8 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] rounded-full flex items-center justify-center">
              <i className="fas fa-lock text-[var(--text-secondary)] text-sm opacity-50"></i>
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-[var(--card-bg)] animate-pulse"
              style={{ backgroundColor: level.color || '#3B82F6' }}
            >
              <span className="text-white font-bold text-sm">{level.levelNumber}</span>
            </div>
          )}
        </div>

        {/* Level Info */}
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{
              background: isCompleted
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : `linear-gradient(135deg, ${level.color || '#3B82F6'}, ${(level.color || '#3B82F6')}cc)`,
            }}
          >
            <i className={`${level.icon || 'fas fa-star'} text-white text-xl`}></i>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {level.name}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              {level.description}
            </p>

            {/* Progress */}
            {!isLocked && (
              <div className="flex items-center gap-3">
                <ProgressRing
                  percentage={progressPercentage}
                  size={50}
                  strokeWidth={5}
                  color={level.color || '#3B82F6'}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    {levelProgress?.completedResources?.length || 0} / {level.resources?.length || 0} مورد
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {isCompleted ? 'مكتمل ✓' : isCurrent ? 'قيد التقدم' : 'لم يبدأ بعد'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LevelNode;
