import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import IconPicker from '../../components/admin/IconPicker.jsx';
import { apiRequest } from '../../api.js';

const levelDefaults = [
  { levelNumber: 1, name: '', description: '', order: 1, requiredCompletions: 0, color: '#F59E0B', icon: 'fa-solid fa-seedling', resources: [] },
  { levelNumber: 2, name: '', description: '', order: 2, requiredCompletions: 0, color: '#10B981', icon: 'fa-solid fa-heart', resources: [] },
  { levelNumber: 3, name: '', description: '', order: 3, requiredCompletions: 0, color: '#3B82F6', icon: 'fa-solid fa-toolbox', resources: [] },
  { levelNumber: 4, name: '', description: '', order: 4, requiredCompletions: 0, color: '#8B5CF6', icon: 'fa-solid fa-star', resources: [] },
];

const iconOptions = [
  { icon: 'fa-road', label: 'رحلة' },
  { icon: 'fa-compass', label: 'استكشاف' },
  { icon: 'fa-brain', label: 'وعي' },
  { icon: 'fa-heart', label: 'صحة نفسية' },
  { icon: 'fa-seedling', label: 'نمو' },
  { icon: 'fa-mountain', label: 'تحدٍ' },
  { icon: 'fa-star', label: 'تميّز' },
  { icon: 'fa-rocket', label: 'انطلاق' },
  { icon: 'fa-shield-alt', label: 'حماية' },
  { icon: 'fa-lightbulb', label: 'إلهام' },
  { icon: 'fa-book-open', label: 'تعلم' },
  { icon: 'fa-graduation-cap', label: 'تعليم' },
  { icon: 'fa-hand-holding-heart', label: 'دعم' },
  { icon: 'fa-dove', label: 'سلام' },
  { icon: 'fa-sun', label: 'أمل' },
  { icon: 'fa-gem', label: 'قيمة' },
  { icon: 'fa-flag', label: 'هدف' },
  { icon: 'fa-key', label: 'مفتاح' },
  { icon: 'fa-tree', label: 'جذور' },
  { icon: 'fa-cloud-sun', label: 'تفاؤل' },
];

const AdminJourneys = () => {
  const { success, error: showError } = useToast();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [resources, setResources] = useState({ articles: [], videos: [], books: [] });
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [hasJourney, setHasJourney] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(null); // { levelIndex, type }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    icon: 'fa-solid fa-road',
    color: '#8B5CF6',
    isActive: true,
    levels: levelDefaults,
  });

  useEffect(() => {
    loadJourney();
    loadResources();
  }, []);

  const loadJourney = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/journey', { method: 'GET' });
      if (data) {
        console.log('Journey loaded from DB:', JSON.stringify(data.levels?.map(l => ({
          level: l.levelNumber,
          resources: l.resources?.map(r => ({ type: r.resourceType, id: r.resourceId }))
        })), null, 2));

        setJourney(data);
        setHasJourney(true);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          longDescription: data.longDescription || '',
          icon: data.icon || 'fa-solid fa-road',
          color: data.color || '#8B5CF6',
          isActive: data.isActive ?? true,
          levels: (data.levels || []).map((level) => ({
            levelNumber: level.levelNumber || 1,
            name: level.name || '',
            description: level.description || '',
            order: level.order || 1,
            requiredCompletions: level.requiredCompletions || 0,
            color: level.color || '#3B82F6',
            icon: level.icon || 'fa-solid fa-star',
            resources: (level.resources || [])
              .filter((r) => r.resourceId && r.resourceId.toString().trim() !== '')
              .map((r) => ({
                resourceType: r.resourceType || 'article',
                resourceId: r.resourceId?.toString() || '',
                isMandatory: r.isMandatory ?? true,
                order: r.order || 1,
              })),
          })),
        });
      } else {
        setJourney(null);
        setHasJourney(false);
      }
    } catch (error) {
      setJourney(null);
      setHasJourney(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResources = useCallback(async () => {
    try {
      setResourcesLoading(true);
      const [articlesRes, videosRes, booksRes] = await Promise.all([
        apiRequest('/articles?limit=100', { method: 'GET' }).catch((err) => {
          console.error('Failed to load articles:', err);
          return { articles: [] };
        }),
        apiRequest('/videos?limit=100', { method: 'GET' }).catch((err) => {
          console.error('Failed to load videos:', err);
          return { videos: [] };
        }),
        apiRequest('/books?limit=100', { method: 'GET' }).catch((err) => {
          console.error('Failed to load books:', err);
          return { books: [] };
        }),
      ]);

      const loadedArticles = articlesRes?.articles || [];
      const loadedVideos = videosRes?.videos || [];
      const loadedBooks = booksRes?.books || [];

      setResources({
        articles: loadedArticles,
        videos: loadedVideos,
        books: loadedBooks,
      });

      // Build set of all valid resource IDs
      const validIds = new Set([
        ...loadedArticles.map(a => a._id),
        ...loadedVideos.map(v => v._id),
        ...loadedBooks.map(b => b._id),
      ]);

      // If journey is loaded, auto-clean invalid resources
      if (hasJourney && journey?._id) {
        setFormData((prev) => {
          const cleanedLevels = prev.levels.map((level) => ({
            ...level,
            resources: (level.resources || []).filter((r) => validIds.has(r.resourceId)),
          }));
          return { ...prev, levels: cleanedLevels };
        });
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  }, [hasJourney, journey?._id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLevelChange = (index, field, value) => {
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      newLevels[index] = { ...newLevels[index], [field]: value };
      return { ...prev, levels: newLevels };
    });
  };

  const addResource = (levelIndex, resourceId) => {
    if (!resourceId) return;
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      const resources = newLevels[levelIndex].resources || [];
      // Check if already added
      if (resources.some((r) => r.resourceId === resourceId)) {
        return prev;
      }
      newLevels[levelIndex].resources = [
        ...resources,
        { resourceType: showResourcePicker.type, resourceId, isMandatory: true, order: resources.length + 1 },
      ];
      return { ...prev, levels: newLevels };
    });
    setShowResourcePicker(null);
  };

  const removeResource = (levelIndex, resourceIndex) => {
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      const resources = [...newLevels[levelIndex].resources];
      resources.splice(resourceIndex, 1);
      newLevels[levelIndex].resources = resources.map((r, i) => ({ ...r, order: i + 1 }));
      return { ...prev, levels: newLevels };
    });
  };

  const toggleMandatory = (levelIndex, resourceIndex) => {
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      const resources = [...newLevels[levelIndex].resources];
      resources[resourceIndex] = { ...resources[resourceIndex], isMandatory: !resources[resourceIndex].isMandatory };
      newLevels[levelIndex].resources = resources;
      return { ...prev, levels: newLevels };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyLevels = formData.levels.filter((l) => !l.name || l.name.trim() === '');
    if (emptyLevels.length > 0) {
      showError(`يرجى تعبئة اسم كل المستويات`);
      return;
    }

    // Clean up: remove resources with empty resourceId
    const cleanData = {
      ...formData,
      levels: formData.levels.map((level) => ({
        ...level,
        resources: (level.resources || []).filter((r) => r.resourceId && r.resourceId.trim() !== ''),
      })),
    };

    setSubmitting(true);
    try {
      if (hasJourney && journey?._id) {
        await apiRequest(`/journey/${journey._id}`, {
          method: 'PATCH',
          body: JSON.stringify(cleanData),
        });
        success('تم تحديث الرحلة بنجاح');
      } else {
        const data = await apiRequest('/journey', {
          method: 'POST',
          body: JSON.stringify(cleanData),
        });
        setJourney(data);
        setHasJourney(true);
        success('تم إنشاء الرحلة بنجاح');
      }
      loadJourney();
    } catch (error) {
      showError(error.message || 'فشل حفظ الرحلة');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async () => {
    if (!journey?._id) return;
    try {
      setToggling(true);
      const newStatus = !journey.isActive;
      setJourney((prev) => prev ? { ...prev, isActive: newStatus } : prev);
      await apiRequest(`/journey/${journey._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: newStatus }),
      });
      success(`تم ${newStatus ? 'تفعيل' : 'إيقاف'} الرحلة`);
      loadJourney();
    } catch (error) {
      showError('فشل التحديث');
      loadJourney();
    } finally {
      setToggling(false);
    }
  };

  const getResourceName = (type, id) => {
    const list = type === 'article' ? resources.articles : type === 'video' ? resources.videos : resources.books;
    const item = list.find((i) => i._id === id);
    if (!item) {
      console.warn(`Resource not found: type=${type}, id=${id}, available=${list.map(i => i._id).join(', ')}`);
      return id ? `مورد (${id.slice(0, 8)}...)` : 'مورد';
    }
    return item?.title || item?.name || 'مورد';
  };

  if (loading) {
    return (
      <AdminLayout title="إدارة الرحلات">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="إدارة الرحلات">
      {/* Status Bar */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {hasJourney ? 'الرحلة الحالية' : 'لا توجد رحلة بعد'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {hasJourney ? journey?.name : 'أنشئ رحلة واحدة ليتمكن المستخدمون من البدء بها'}
            </p>
          </div>
          {hasJourney && (
            <button
              onClick={toggleActive}
              disabled={toggling}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
                journey?.isActive
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'bg-gray-500/20 text-gray-500'
              }`}
            >
              {toggling ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div> جاري التحديث...</>
              ) : journey?.isActive ? (
                'نشط'
              ) : (
                'متوقف'
              )}
            </button>
          )}
        </div>
      </AnimatedItem>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Journey Info */}
        <AnimatedItem type="slideUp" delay={0.15}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              <i className="fas fa-info-circle ml-2 text-[var(--primary-color)]"></i>
              معلومات الرحلة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  اسم الرحلة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  placeholder="رحلة الوعي النفسي"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  الوصف المختصر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                  placeholder="رحلة تعليمية مكونة من 4 مستويات"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">الوصف التفصيلي</label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors"
                  placeholder="وصف تفصيلي للرحلة..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">الأيقونة</label>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData((prev) => ({ ...prev, icon }))}
                  options={iconOptions}
                />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">اللون</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full h-12 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl cursor-pointer"
                  />
                </div>
                <label className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl cursor-pointer h-full">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">نشط</p>
                    <p className="text-xs text-[var(--text-secondary)]">متاح للمستخدمين</p>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </AnimatedItem>

        {/* Levels - Simplified Cards */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">
              <i className="fas fa-layer-group ml-2 text-[var(--primary-color)]"></i>
              المستويات الأربعة
            </h3>

            <div className="space-y-6">
              {formData.levels.map((level, levelIndex) => (
                <div
                  key={levelIndex}
                  className="rounded-2xl border-2 overflow-hidden transition-all"
                  style={{ borderColor: level.color + '40' }}
                >
                  {/* Level Header */}
                  <div className="p-4 md:p-5 text-white flex items-center gap-4" style={{ backgroundColor: level.color }}>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {level.levelNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => handleLevelChange(levelIndex, 'name', e.target.value)}
                        placeholder={`اكتب اسم المستوى ${level.levelNumber}`}
                        required
                        className="w-full bg-transparent text-white placeholder-white/50 text-lg font-bold focus:outline-none"
                      />
                      <input
                        type="text"
                        value={level.description}
                        onChange={(e) => handleLevelChange(levelIndex, 'description', e.target.value)}
                        placeholder="وصف قصير للمستوى..."
                        required
                        className="w-full bg-transparent text-white/80 placeholder-white/40 text-sm focus:outline-none mt-1"
                      />
                    </div>
                  </div>

                  {/* Level Content */}
                  <div className="p-4 md:p-5 bg-[var(--bg-secondary)]">
                    {/* Resources List */}
                    {level.resources.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                          المحتوى ({level.resources.length})
                        </h4>
                        {level.resources.map((resource, resourceIndex) => (
                          <div
                            key={resourceIndex}
                            className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]/30"
                          >
                            {/* Resource Type Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              resource.resourceType === 'article' ? 'bg-blue-500/20 text-blue-500' :
                              resource.resourceType === 'video' ? 'bg-purple-500/20 text-purple-500' :
                              'bg-green-500/20 text-green-500'
                            }`}>
                              <i className={`fas ${
                                resource.resourceType === 'article' ? 'fa-newspaper' :
                                resource.resourceType === 'video' ? 'fa-play-circle' :
                                'fa-book'
                              }`}></i>
                            </div>

                            {/* Resource Name */}
                            <span className="flex-1 text-sm text-[var(--text-primary)] font-medium truncate">
                              {getResourceName(resource.resourceType, resource.resourceId)}
                            </span>

                            {/* Required Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleMandatory(levelIndex, resourceIndex)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                                resource.isMandatory
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-gray-500/20 text-gray-500'
                              }`}
                            >
                              {resource.isMandatory ? 'مطلوب' : 'اختياري'}
                            </button>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => removeResource(levelIndex, resourceIndex)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 mb-4 bg-[var(--card-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                        <i className="fas fa-folder-open text-2xl text-[var(--text-secondary)] opacity-30 mb-2"></i>
                        <p className="text-sm text-[var(--text-secondary)]">لا يوجد محتوى بعد</p>
                      </div>
                    )}

                    {/* Add Content Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                        <i className="fas fa-plus text-[var(--primary-color)]"></i>
                        أضف محتوى:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowResourcePicker(showResourcePicker?.levelIndex === levelIndex && showResourcePicker?.type === 'article' ? null : { levelIndex, type: 'article' })}
                        className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg text-sm hover:bg-blue-500/20 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-newspaper"></i> مقال
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResourcePicker(showResourcePicker?.levelIndex === levelIndex && showResourcePicker?.type === 'video' ? null : { levelIndex, type: 'video' })}
                        className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg text-sm hover:bg-purple-500/20 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-play-circle"></i> فيديو
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResourcePicker(showResourcePicker?.levelIndex === levelIndex && showResourcePicker?.type === 'book' ? null : { levelIndex, type: 'book' })}
                        className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20 transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-book"></i> كتاب
                      </button>
                    </div>

                    {/* Resource Picker Dropdown */}
                    {showResourcePicker && showResourcePicker.levelIndex === levelIndex && (
                      <div className="mt-4 p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]/30">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-[var(--text-primary)]">
                            اختر {showResourcePicker.type === 'article' ? 'مقالاً' : showResourcePicker.type === 'video' ? 'فيديو' : 'كتاباً'}
                          </h5>
                          <button
                            type="button"
                            onClick={() => setShowResourcePicker(null)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        {resourcesLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
                          </div>
                        ) : (
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {(showResourcePicker.type === 'article' ? resources.articles :
                              showResourcePicker.type === 'video' ? resources.videos :
                              resources.books
                            ).length === 0 ? (
                              <p className="text-center py-4 text-sm text-[var(--text-secondary)]">لا توجد عناصر</p>
                            ) : (
                              (showResourcePicker.type === 'article' ? resources.articles :
                                showResourcePicker.type === 'video' ? resources.videos :
                                resources.books
                              ).map((item) => {
                                const alreadyAdded = formData.levels[levelIndex].resources.some(
                                  (r) => r.resourceId === item._id
                                );
                                return (
                                  <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => addResource(levelIndex, item._id)}
                                    disabled={alreadyAdded}
                                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                                      alreadyAdded
                                        ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                                    }`}
                                  >
                                    {item.title || item.name || 'بدون عنوان'}
                                    {alreadyAdded && <span className="mr-2 text-xs">(مضاف مسبقاً)</span>}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedItem>

        {/* Submit Button */}
        <AnimatedItem type="slideUp" delay={0.25}>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {submitting ? (
                <><i className="fas fa-spinner fa-spin"></i> جاري الحفظ...</>
              ) : (
                <><i className="fas fa-save"></i> {hasJourney ? 'حفظ التغييرات' : 'إنشاء الرحلة'}</>
              )}
            </button>
          </div>
        </AnimatedItem>
      </form>
    </AdminLayout>
  );
};

export default AdminJourneys;
