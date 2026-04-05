import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import IconPicker from '../../components/admin/IconPicker.jsx';
import { apiRequest } from '../../api.js';

const AdminJourneys = () => {
  const { success, error: showError } = useToast();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState([0]);
  const [resources, setResources] = useState({ articles: [], videos: [], books: [] });
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [hasJourney, setHasJourney] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    icon: 'fa-solid fa-road',
    color: '#8B5CF6',
    isActive: true,
    levels: [
      { levelNumber: 1, name: '', description: '', order: 1, requiredCompletions: 0, color: '#F59E0B', icon: 'fa-solid fa-seedling', resources: [] },
      { levelNumber: 2, name: '', description: '', order: 2, requiredCompletions: 0, color: '#10B981', icon: 'fa-solid fa-heart', resources: [] },
      { levelNumber: 3, name: '', description: '', order: 3, requiredCompletions: 0, color: '#3B82F6', icon: 'fa-solid fa-toolbox', resources: [] },
      { levelNumber: 4, name: '', description: '', order: 4, requiredCompletions: 0, color: '#8B5CF6', icon: 'fa-solid fa-star', resources: [] },
    ],
  });

  useEffect(() => {
    loadJourney();
    loadResources();
  }, []);

  const loadJourney = useCallback(async () => {
    try {
      setLoading(true);
      // Use the public active journey endpoint since there's only one
      const data = await apiRequest('/journey', { method: 'GET' });
      if (data) {
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
            resources: (level.resources || []).map((r) => ({
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
      // No active journey yet
      setJourney(null);
      setHasJourney(false);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const loadResources = useCallback(async () => {
    try {
      setResourcesLoading(true);
      const [articlesRes, videosRes, booksRes] = await Promise.all([
        apiRequest('/articles?limit=100', { method: 'GET' }).catch(() => ({ articles: [] })),
        apiRequest('/videos?limit=100', { method: 'GET' }).catch(() => ({ videos: [] })),
        apiRequest('/books?limit=100', { method: 'GET' }).catch(() => ({ books: [] })),
      ]);
      setResources({
        articles: articlesRes?.articles || articlesRes?.data || articlesRes || [],
        videos: videosRes?.videos || videosRes?.data || videosRes || [],
        books: booksRes?.books || booksRes?.data || booksRes || [],
      });
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

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

  const toggleLevel = (index) => {
    setExpandedLevels((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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

  const addResource = (levelIndex) => {
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      const resources = newLevels[levelIndex].resources || [];
      newLevels[levelIndex].resources = [
        ...resources,
        { resourceType: 'article', resourceId: '', isMandatory: true, order: resources.length + 1 },
      ];
      return { ...prev, levels: newLevels };
    });
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

  const updateResource = (levelIndex, resourceIndex, field, value) => {
    setFormData((prev) => {
      const newLevels = [...prev.levels];
      const resources = [...newLevels[levelIndex].resources];
      resources[resourceIndex] = { ...resources[resourceIndex], [field]: value };
      newLevels[levelIndex].resources = resources;
      return { ...prev, levels: newLevels };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: check no empty resource IDs
    const emptyResources = [];
    formData.levels.forEach((level, levelIndex) => {
      level.resources.forEach((resource, resourceIndex) => {
        if (!resource.resourceId || resource.resourceId.trim() === '') {
          emptyResources.push(`المستوى ${level.levelNumber} - مورد ${resourceIndex + 1}`);
        }
      });
    });

    if (emptyResources.length > 0) {
      showError(`يرجى اختيار مورد أو حذف الموارد الفارغة من: ${emptyResources.join('، ')}`);
      return;
    }

    // Validate: check levels have names
    const emptyLevels = formData.levels.filter((l) => !l.name || l.name.trim() === '');
    if (emptyLevels.length > 0) {
      showError(`يرجى تعبئة اسم المستوى: ${emptyLevels.map((l) => `المستوى ${l.levelNumber}`).join('، ')}`);
      return;
    }

    setSubmitting(true);
    try {
      if (hasJourney && journey?._id) {
        await apiRequest(`/journey/${journey._id}`, {
          method: 'PATCH',
          body: JSON.stringify(formData),
        });
        success('تم تحديث الرحلة بنجاح');
      } else {
        const data = await apiRequest('/journey', {
          method: 'POST',
          body: JSON.stringify(formData),
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
      // Optimistically update UI
      setJourney((prev) => prev ? { ...prev, isActive: newStatus } : prev);
      
      await apiRequest(`/journey/${journey._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: newStatus }),
      });
      success(`تم ${newStatus ? 'تفعيل' : 'إيقاف'} الرحلة`);
      loadJourney();
    } catch (error) {
      showError('فشل التحديث');
      loadJourney(); // Revert on error
    } finally {
      setToggling(false);
    }
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
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              {hasJourney ? 'الرحلة الحالية' : 'لا توجد رحلة بعد'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {hasJourney
                ? journey?.name
                : 'أنشئ رحلة واحدة ليتمكن المستخدمون من البدء بها'}
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
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  جاري التحديث...
                </>
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
        {/* Basic Info */}
        <AnimatedItem type="slideUp" delay={0.15}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              <i className="fas fa-info-circle ml-2 text-[var(--primary-color)]"></i>
              معلومات الرحلة
            </h3>
            <div className="mb-4">
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
            <div className="mb-4">
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                الوصف التفصيلي
              </label>
              <textarea
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] resize-none transition-colors"
                placeholder="وصف تفصيلي للرحلة..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  الأيقونة
                </label>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) =>
                    setFormData((prev) => ({ ...prev, icon }))
                  }
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
                <div className="flex-1">
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
          </div>
        </AnimatedItem>

        {/* Levels */}
        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                <i className="fas fa-layer-group ml-2 text-[var(--primary-color)]"></i>
                المستويات
              </h3>
              <span className="text-sm text-[var(--text-secondary)]">
                {formData.levels.filter((l) => l.name).length}/4 مكتملة
              </span>
            </div>

            <div className="space-y-3">
              {formData.levels.map((level, levelIndex) => {
                const isExpanded = expandedLevels.includes(levelIndex);
                const hasContent = level.name || level.description;
                const resourceCount = level.resources.length;

                return (
                  <div
                    key={levelIndex}
                    className="border border-[var(--border-color)]/30 rounded-xl overflow-hidden bg-[var(--bg-secondary)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleLevel(levelIndex)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-[var(--bg-primary)]/50 transition-colors text-right"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: level.color }}
                      >
                        {level.levelNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[var(--text-primary)]">
                          {level.name || `المستوى ${level.levelNumber}`}
                        </span>
                        {hasContent && (
                          <span className="text-xs text-[var(--text-secondary)] mr-2">
                            {resourceCount} مورد
                          </span>
                        )}
                      </div>
                      {hasContent && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs">
                          مكتمل
                        </span>
                      )}
                      <i
                        className={`fas fa-chevron-down text-[var(--text-secondary)] transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      ></i>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-[var(--border-color)]/30">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            اسم المستوى <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={level.name}
                            onChange={(e) => handleLevelChange(levelIndex, 'name', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                            placeholder="البداية: فهم الذات"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                            وصف المستوى <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={level.description}
                            onChange={(e) => handleLevelChange(levelIndex, 'description', e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                            placeholder="تعرف على أساسيات الصحة النفسية"
                          />
                        </div>

                        {/* Resources */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-[var(--text-secondary)]">
                              الموارد ({resourceCount})
                            </h4>
                            <button
                              type="button"
                              onClick={() => addResource(levelIndex)}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <i className="fas fa-plus ml-1"></i> إضافة مورد
                            </button>
                          </div>

                          {level.resources.length === 0 && (
                            <div className="text-center py-6 bg-[var(--card-bg)] rounded-xl border border-dashed border-[var(--border-color)]">
                              <i className="fas fa-layer-group text-2xl text-[var(--text-secondary)] opacity-30 mb-2"></i>
                              <p className="text-sm text-[var(--text-secondary)]">لا توجد موارد بعد</p>
                              <button
                                type="button"
                                onClick={() => addResource(levelIndex)}
                                className="mt-2 text-sm text-[var(--primary-color)] hover:underline"
                              >
                                <i className="fas fa-plus ml-1"></i> أضف أول مورد
                              </button>
                            </div>
                          )}

                          <div className="space-y-2">
                            {level.resources.map((resource, resourceIndex) => {
                              const resourceList =
                                resource.resourceType === 'article'
                                  ? resources.articles
                                  : resource.resourceType === 'video'
                                  ? resources.videos
                                  : resources.books;

                              return (
                                <div
                                  key={resourceIndex}
                                  className="flex items-center gap-2 p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]/30"
                                >
                                  <select
                                    value={resource.resourceType}
                                    onChange={(e) =>
                                      updateResource(levelIndex, resourceIndex, 'resourceType', e.target.value)
                                    }
                                    className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                                  >
                                    <option value="article">مقال</option>
                                    <option value="video">فيديو</option>
                                    <option value="book">كتاب</option>
                                  </select>

                                  <select
                                    value={resource.resourceId}
                                    onChange={(e) =>
                                      updateResource(levelIndex, resourceIndex, 'resourceId', e.target.value)
                                    }
                                    className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)]"
                                    disabled={resourcesLoading || resourceList.length === 0}
                                  >
                                    <option value="">
                                      {resourcesLoading
                                        ? 'جاري التحميل...'
                                        : resourceList.length === 0
                                        ? 'لا توجد موارد'
                                        : 'اختر موردًا...'}
                                    </option>
                                    {resourceList.map((item) => (
                                      <option key={item._id} value={item._id}>
                                        {item.title || item.name || 'بدون عنوان'}
                                      </option>
                                    ))}
                                  </select>

                                  <label className="flex items-center gap-1 text-xs cursor-pointer flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={resource.isMandatory}
                                      onChange={(e) =>
                                        updateResource(
                                          levelIndex,
                                          resourceIndex,
                                          'isMandatory',
                                          e.target.checked,
                                        )
                                      }
                                    />
                                    مطلوب
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => removeResource(levelIndex, resourceIndex)}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedItem>

        {/* Submit */}
        <AnimatedItem type="slideUp" delay={0.25}>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {hasJourney ? 'حفظ التغييرات' : 'إنشاء الرحلة'}
                </>
              )}
            </button>
          </div>
        </AnimatedItem>
      </form>
    </AdminLayout>
  );
};

export default AdminJourneys;
