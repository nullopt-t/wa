import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useJourney } from '../context/JourneyContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProgressRing from '../components/journey/ProgressRing.jsx';
import { apiRequest } from '../api.js';
import { useNavigate } from 'react-router-dom';

const JourneyPage = () => {
  const { journey, loading, error, progress, startJourney, hasStarted, currentLevel } = useJourney();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [starting, setStarting] = useState(false);
  const [resourceDetails, setResourceDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Fetch resource details for all levels
  const loadResourceDetails = useCallback(async () => {
    if (!journey?.levels) return;
    const allResources = [];
    journey.levels.forEach((level) => {
      (level.resources || []).forEach((r) => {
        if (!resourceDetails[r.resourceId]) {
          allResources.push(r);
        }
      });
    });
    if (allResources.length === 0) return;

    setDetailsLoading(true);
    const details = { ...resourceDetails };
    await Promise.all(
      allResources.map(async (resource) => {
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
  }, [journey]);

  useEffect(() => {
    loadResourceDetails();
  }, [loadResourceDetails]);

  const handleStartJourney = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/journey' } });
      return;
    }

    try {
      setStarting(true);
      await startJourney();
      // Auto-navigate to level 1 after starting
      navigate('/journey/level/1');
    } catch (err) {
      console.error('Error starting journey:', err);
      alert('حدث خطأ أثناء بدء الرحلة: ' + err.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">جاري تحميل الرحلة...</p>
        </div>
      </div>
    );
  }

  if (error && !journey) {
    const isAdmin = user?.role === 'admin';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 flex items-center justify-center">
            <i className="fas fa-road text-4xl text-[var(--text-secondary)] opacity-50"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            لا توجد رحلة حالياً
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {isAdmin ? 'قم بإنشاء رحلة جديدة من لوحة الإدارة' : 'لم يتم إضافة رحلة بعد. ترقب التحديثات!'}
          </p>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/journeys')}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition"
            >
              <i className="fas fa-plus ml-2"></i>
              إنشاء رحلة من لوحة الإدارة
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!journey || journey.isActive === false) {
    const isAdmin = user?.role === 'admin';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/30 flex items-center justify-center">
            <i className="fas fa-road text-4xl text-[var(--text-secondary)] opacity-50"></i>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            لا توجد رحلة حالياً
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            {isAdmin ? 'قم بإنشاء رحلة جديدة من لوحة الإدارة' : 'لم يتم إضافة رحلة بعد. ترقب التحديثات!'}
          </p>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/journeys')}
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition"
            >
              <i className="fas fa-plus ml-2"></i>
              إنشاء رحلة من لوحة الإدارة
            </button>
          )}
        </div>
      </div>
    );
  }

  const journeyColor = journey.color || '#8B5CF6';

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: journeyColor }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-5"
          style={{ backgroundColor: journeyColor }}
        ></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--card-bg)] backdrop-blur-md rounded-3xl border border-[var(--border-color)]/30 overflow-hidden shadow-xl mb-8"
        >
          {/* Hero Header */}
          <div
            className="relative p-8 md:p-12 text-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${journeyColor}15 0%, ${journeyColor}08 50%, transparent 100%)`,
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${journeyColor}, ${journeyColor}cc)`,
              }}
            >
              <i className={`fas ${journey.icon || 'fa-road'} text-4xl md:text-5xl text-white`}></i>
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
              {journey.name}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6 leading-relaxed">
              {journey.description}
            </p>

            {/* Stats Badges */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] rounded-full border border-[var(--border-color)]/30">
                <i className="fas fa-layer-group text-[var(--primary-color)]"></i>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {journey.levels.filter((l) =>
                    l.resources && l.resources.some((r) => resourceDetails[r.resourceId] !== null && resourceDetails[r.resourceId] !== undefined)
                  ).length} مستويات متاحة
                </span>
              </div>
            </div>

            {/* Progress Overview (if started) */}
            {hasStarted && progress && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto"
              >
                <div className="flex items-center gap-4 mb-3">
                  <ProgressRing
                    percentage={progress.overallProgress}
                    size={70}
                    strokeWidth={6}
                    color={journeyColor}
                  />
                  <div className="text-right flex-1">
                    <div className="text-sm text-[var(--text-secondary)] mb-1">تقدمك الكلي</div>
                    <div className="text-3xl font-bold" style={{ color: journeyColor }}>
                      {progress.overallProgress}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-3 overflow-hidden border border-[var(--border-color)]/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.overallProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: journeyColor }}
                  >
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      }}
                    ></div>
                  </motion.div>
                </div>

                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                  المستوى الحالي:{' '}
                  <span className="font-bold text-[var(--text-primary)]">
                    {progress.currentLevel}
                  </span>{' '}
                  من {journey.levels.filter((l) =>
                    l.resources && l.resources.some((r) => resourceDetails[r.resourceId] !== null && resourceDetails[r.resourceId] !== undefined)
                  ).length}
                </div>
              </motion.div>
            )}
          </div>

          {/* Start Button */}
          {!hasStarted && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartJourney}
              disabled={starting}
              className="w-full px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${journeyColor}, ${journeyColor}cc)`,
              }}
            >
              {starting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  جاري البدء...
                </>
              ) : (
                <>
                  <i className="fas fa-play-circle text-2xl"></i>
                  ابدأ الرحلة
                </>
              )}
            </motion.button>
          )}
        </motion.div>

        {/* Journey Path - Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Path Line */}
          <div
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 hidden md:block"
            style={{
              transform: 'translateX(-50%)',
              background: `linear-gradient(to bottom, ${journeyColor}40, ${journeyColor}20)`,
            }}
          ></div>

          {/* Level Cards */}
          <div className="space-y-4 md:space-y-6">
            {journey.levels
              .map((level) => {
                // Filter to only valid resources
                const validResources = (level.resources || []).filter(
                  (r) => resourceDetails[r.resourceId] !== null && resourceDetails[r.resourceId] !== undefined
                );
                return { ...level, validResources };
              })
              .filter((level) => level.validResources.length > 0)
              .map((level, index) => {
              const levelProgress = progress?.levelProgress?.find(
                (lp) => lp.levelNumber === level.levelNumber
              );
              const validResourceIds = level.validResources.map((r) => r.resourceId.toString());
              const completedValidResources = levelProgress?.completedResources?.filter((cr) =>
                validResourceIds.includes(cr.resourceId.toString())
              ) || [];
              const isCompleted = levelProgress?.isCompleted || false;
              const isLocked = hasStarted ? level.levelNumber > currentLevel : !hasStarted;
              const isCurrent = hasStarted && level.levelNumber === currentLevel;
              const completedCount = completedValidResources.length;
              const totalCount = level.validResources.length;
              const progressPercentage = totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0;

              return (
                <motion.div
                  key={level._id || level.levelNumber}
                  initial={{ opacity: 0, x: isLocked ? 20 : -20 }}
                  animate={{ opacity: isLocked ? 0.5 : 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border shadow-lg overflow-hidden transition-all duration-300
                    ${isCompleted
                      ? 'border-green-500/30 shadow-green-500/10'
                      : isCurrent
                      ? 'border-[var(--primary-color)]/50 shadow-xl'
                      : isLocked
                      ? 'border-[var(--border-color)]/20'
                      : 'border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/40 hover:shadow-xl'
                    }
                  `}
                  style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
                  onClick={() => !isLocked && navigate(`/journey/level/${level.levelNumber}`)}
                >
                  {/* Level Color Accent Bar */}
                  <div
                    className="absolute top-0 right-0 bottom-0 w-1 md:w-1.5"
                    style={{
                      backgroundColor: isCompleted ? '#10B981' : level.color || journeyColor,
                    }}
                  ></div>

                  <div className="p-5 md:p-6 pr-8 md:pr-12">
                    <div className="flex items-start gap-4">
                      {/* Level Number / Status Icon */}
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-md"
                          style={{
                            background: isCompleted
                              ? 'linear-gradient(135deg, #10B981, #059669)'
                              : `linear-gradient(135deg, ${level.color || journeyColor}, ${(level.color || journeyColor)}cc)`,
                          }}
                        >
                          {isCompleted ? (
                            <i className="fas fa-check text-white text-2xl"></i>
                          ) : isLocked ? (
                            <i className="fas fa-lock text-white/60 text-xl"></i>
                          ) : (
                            <span className="text-white font-bold text-2xl">{level.levelNumber}</span>
                          )}
                        </div>

                        {/* Pulse ring for current level */}
                        {isCurrent && (
                          <div
                            className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                            style={{ backgroundColor: level.color || journeyColor }}
                          ></div>
                        )}
                      </div>

                      {/* Level Info */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)]">
                            {level.name}
                          </h3>
                          {isCompleted && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                              مكتمل ✓
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-white rounded-full text-xs font-medium" style={{ backgroundColor: level.color || journeyColor }}>
                              قيد التقدم
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                          {level.description}
                        </p>

                        {/* Progress Info */}
                        {!isLocked && (
                          <div className="flex items-center gap-4 flex-wrap">
                            <ProgressRing
                              percentage={progressPercentage}
                              size={44}
                              strokeWidth={4}
                              color={level.color || journeyColor}
                              showText={false}
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[var(--text-primary)] mb-1">
                                {completedCount} / {totalCount} مورد
                              </div>
                              {/* Mini Progress Bar */}
                              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]/20">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: level.color || journeyColor }}
                                ></motion.div>
                              </div>
                            </div>
                          </div>
                        )}

                        {isLocked && (
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <i className="fas fa-lock text-xs opacity-50"></i>
                            <span>أكمل المستويات السابقة لفتح هذا المستوى</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow Icon (if not locked) */}
                      {!isLocked && (
                        <div className="flex-shrink-0 self-center">
                          <i className="fas fa-chevron-left text-[var(--text-secondary)] opacity-30"></i>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JourneyPage;
