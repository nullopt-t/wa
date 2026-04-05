import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJourney } from '../context/JourneyContext.jsx';
import ResourceCard from '../components/journey/ResourceCard.jsx';
import CelebrationModal from '../components/journey/CelebrationModal.jsx';
import ProgressRing from '../components/journey/ProgressRing.jsx';
import { apiRequest } from '../api.js';

const JourneyLevelPage = () => {
  const { levelNumber } = useParams();
  const navigate = useNavigate();
  const {
    journey,
    loading,
    progress,
    completeResource,
    completeLevel,
    currentLevel,
  } = useJourney();

  const [celebration, setCelebration] = useState(null);
  const [completingResource, setCompletingResource] = useState(null);
  const [resourceDetails, setResourceDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  const level = journey?.levels.find((l) => l.levelNumber === parseInt(levelNumber));

  // Fetch resource details for the level
  const loadResourceDetails = useCallback(async (resources) => {
    if (!resources || resources.length === 0) return;
    setDetailsLoading(true);
    const details = {};
    await Promise.all(
      resources.map(async (resource) => {
        try {
          const endpoint =
            resource.resourceType === 'article'
              ? `/articles/${resource.resourceId}`
              : resource.resourceType === 'video'
              ? `/videos/${resource.resourceId}`
              : `/books/${resource.resourceId}`;
          const data = await apiRequest(endpoint, { method: 'GET' });
          details[resource.resourceId] = data;
        } catch {
          details[resource.resourceId] = null;
        }
      })
    );
    setResourceDetails(details);
    setDetailsLoading(false);
  }, []);

  useEffect(() => {
    if (level) {
      setResourceDetails({});
      loadResourceDetails(level.resources);
    }
  }, [level, loadResourceDetails]);

  const getResourcePath = (resource) => {
    const detail = resourceDetails[resource.resourceId];
    if (resource.resourceType === 'article') {
      return detail?.slug ? `/articles/${detail.slug}` : `/articles/${resource.resourceId}`;
    }
    if (resource.resourceType === 'video') {
      return `/videos`;
    }
    if (resource.resourceType === 'book') {
      return detail?.slug ? `/books/${detail.slug}` : `/books/${resource.resourceId}`;
    }
  };

  if (loading || !journey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">جاري تحميل المستوى...</p>
        </div>
      </div>
    );
  }

  // Check if journey is inactive
  if (journey.isActive === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 flex items-center justify-center">
            <i className="fas fa-ban text-4xl text-[var(--text-secondary)] opacity-50"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            الرحلة غير متاحة حالياً
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            تم إيقاف الرحلة مؤقتاً. يرجى المحاولة لاحقاً.
          </p>
          <button
            onClick={() => navigate('/journey')}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 flex items-center justify-center">
            <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            المستوى غير موجود
          </h2>
          <button
            onClick={() => navigate('/journey')}
            className="mt-4 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition"
          >
            العودة للرحلة
          </button>
        </div>
      </div>
    );
  }

  const levelProgress = progress?.levelProgress?.find(
    (lp) => lp.levelNumber === parseInt(levelNumber)
  );

  // Only count resources that are actually linked to real content
  const validResources = (level.resources || []).filter((r) =>
    resourceDetails[r.resourceId] !== null && resourceDetails[r.resourceId] !== undefined
  );
  const completedResources = levelProgress?.completedResources?.filter((cr) =>
    validResources.some((vr) => vr.resourceId.toString() === cr.resourceId.toString())
  ) || [];
  const isCompleted = levelProgress?.isCompleted || false;
  const progressPercentage = validResources.length > 0
    ? Math.round((completedResources.length / validResources.length) * 100)
    : 0;
  const levelColor = level.color || '#3B82F6';

  const handleCompleteResource = async (resource) => {
    try {
      setCompletingResource(resource.resourceId);
      await completeResource({
        levelNumber: parseInt(levelNumber),
        resourceType: resource.resourceType,
        resourceId: resource.resourceId,
      });
      setCompletingResource(null);
    } catch (err) {
      console.error('Error completing resource:', err);
      setCompletingResource(null);
    }
  };

  const handleCompleteLevel = async () => {
    if (isCompleted) return;

    try {
      await completeLevel({ levelNumber: parseInt(levelNumber) });

      const nextLevel = parseInt(levelNumber) + 1;
      const isLastLevel = nextLevel > journey.levels.length;

      setCelebration({
        title: '!أحسنت',
        message: isLastLevel
          ? 'لقد أكملت الرحلة بالكامل! أنت رائع'
          : `لقد أكملت المستوى ${levelNumber}!`,
        subtitle: isLastLevel
          ? 'لقد حققت إنجازاً عظيماً في رحلتك النفسية'
          : `انتقل إلى المستوى ${nextLevel} لمواصلة التعلم`,
        icon: isLastLevel ? 'fa-crown' : 'fa-star',
        color: isLastLevel ? '#F59E0B' : levelColor,
      });
    } catch (err) {
      console.error('Error completing level:', err);
    }
  };

  const isLocked = !progress || parseInt(levelNumber) > currentLevel;

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 flex items-center justify-center">
            <i className="fas fa-lock text-4xl text-[var(--text-secondary)] opacity-50"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {progress ? 'المستوى مقفل' : 'لم تبدأ الرحلة بعد'}
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {progress
              ? 'يجب إكمال المستويات السابقة أولاً'
              : 'ابدأ الرحلة أولاً من صفحة الرحلة الرئيسية'}
          </p>
          <button
            onClick={() => navigate('/journey')}
            className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition"
          >
            العودة للرحلة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: levelColor }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-5"
          style={{ backgroundColor: levelColor }}
        ></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/journey')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)]/30 rounded-xl text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]/30 transition-all"
        >
          <i className="fas fa-arrow-right"></i>
          <span>العودة للرحلة</span>
        </motion.button>

        {/* Level Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card-bg)] backdrop-blur-md rounded-3xl border border-[var(--border-color)]/30 shadow-xl overflow-hidden mb-8"
        >
          {/* Header Gradient */}
          <div
            className="relative p-6 md:p-8 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${levelColor}15 0%, ${levelColor}08 50%, transparent 100%)`,
            }}
          >
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
                }}
              >
                <i className={`fas ${level.icon || 'fa-star'} text-white text-3xl md:text-4xl`}></i>
              </div>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white shadow"
                    style={{ backgroundColor: levelColor }}
                  >
                    المستوى {level.levelNumber}
                  </span>
                  {isCompleted && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                      مكتمل ✓
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">
                  {level.name}
                </h1>
                <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
                  {level.description}
                </p>
              </div>

              {/* Progress Ring */}
              <div className="flex-shrink-0 self-center">
                <ProgressRing
                  percentage={progressPercentage}
                  size={70}
                  strokeWidth={6}
                  color={levelColor}
                />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {completedResources.length} من {level.resources.length} مورد مكتمل
                </span>
                <span className="text-sm font-bold" style={{ color: levelColor }}>
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 overflow-hidden border border-[var(--border-color)]/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full relative"
                  style={{ backgroundColor: levelColor }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    }}
                  ></div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resources Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--card-bg)] backdrop-blur-md rounded-3xl border border-[var(--border-color)]/30 shadow-xl overflow-hidden mb-8"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${levelColor}20` }}>
                <i className="fas fa-layer-group" style={{ color: levelColor }}></i>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                الموارد
              </h2>
            </div>

            <div className="space-y-3">
              {level.resources
                .filter((r) => {
                  // Only show resources that have a valid linked resource
                  if (detailsLoading) return true; // show all while loading
                  return resourceDetails[r.resourceId] !== undefined && resourceDetails[r.resourceId] !== null;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((resource, index) => {
                  const detail = resourceDetails[resource.resourceId];
                  const title = detail?.title || detail?.name || null;
                  const isResourceCompleted = completedResources.some(
                    (cr) =>
                      cr.resourceType === resource.resourceType &&
                      cr.resourceId.toString() === resource.resourceId.toString()
                  );

                  return (
                    <ResourceCard
                      key={resource.resourceId}
                      resource={resource}
                      title={title}
                      isCompleted={isResourceCompleted}
                      onToggleComplete={!isCompleted ? handleCompleteResource : null}
                      isLoading={completingResource === resource.resourceId}
                      onNavigate={() => {
                        const path = getResourcePath(resource);
                        if (path) navigate(path);
                      }}
                    />
                  );
                })}
              {!detailsLoading && level.resources.filter((r) => resourceDetails[r.resourceId] !== undefined && resourceDetails[r.resourceId] !== null).length === 0 && (
                <div className="text-center py-8 bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--border-color)]">
                  <i className="fas fa-inbox text-3xl text-[var(--text-secondary)] opacity-30 mb-2"></i>
                  <p className="text-sm text-[var(--text-secondary)]">لا توجد موارد متاحة في هذا المستوى بعد</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {!isCompleted ? (
            <button
              onClick={handleCompleteLevel}
              disabled={completedResources.length === 0}
              className="w-full px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              style={{
                background: completedResources.length > 0
                  ? `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`
                  : 'var(--bg-secondary)',
              }}
            >
              <i className="fas fa-check-circle text-2xl"></i>
              إكمال المستوى
            </button>
          ) : (
            <button
              onClick={() => navigate('/journey')}
              className="w-full px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
              }}
            >
              <i className="fas fa-arrow-right text-xl"></i>
              العودة للرحلة
            </button>
          )}
        </motion.div>
      </div>

      {/* Celebration Modal */}
      {celebration && (
        <CelebrationModal
          isOpen={!!celebration}
          onClose={() => {
            setCelebration(null);
            const nextLevel = parseInt(levelNumber) + 1;
            if (nextLevel <= journey.levels.length) {
              navigate(`/journey/level/${nextLevel}`);
            } else {
              navigate('/journey');
            }
          }}
          {...celebration}
        />
      )}
    </div>
  );
};

export default JourneyLevelPage;
