import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { medicalContactsAPI } from '../../services/medicalContactApi.js';

const AdminMedicalContacts = () => {
  const { success, error: showError } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToAction, setContactToAction] = useState(null);
  const [stats, setStats] = useState({ total: 0, hospitals: 0, clinics: 0, doctors: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'hospital',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [filterType, pagination.currentPage]);

  const loadStats = async () => {
    try {
      const data = await medicalContactsAPI.getStats();
      if (data?.data) {
        setStats(data.data);
      }
    } catch (error) {
      // Silent fail - stats stay at default values
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page: String(pagination.currentPage),
        limit: '20',
      };
      if (filterType !== 'all') params.type = filterType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await medicalContactsAPI.getAllAdmin(params);
      setContacts(data?.data || []);
      setPagination(data?.pagination || { currentPage: 1, totalPages: 1, total: 0 });
    } catch (error) {
      showError('فشل في تحميل جهات الاتصال');
      setContacts([]);
      setPagination({ currentPage: 1, totalPages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedIds([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadContacts();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      await medicalContactsAPI.deleteMany(selectedIds);
      success(`تم حذف ${selectedIds.length} جهة اتصال بنجاح`);
      setShowBulkDeleteDialog(false);
      setSelectedIds([]);
      loadContacts();
      loadStats();
    } catch (error) {
      showError('فشل حذف جهات الاتصال');
    }
  };

  const openCreateModal = () => {
    setSelectedIds([]);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      type: 'hospital',
      isActive: true,
      notes: '',
    });
    setContactToAction(null);
    setShowModal(true);
  };

  const openEditModal = (contact) => {
    setSelectedIds([]);
    setFormData({
      name: contact.name || '',
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || '',
      type: contact.type || 'hospital',
      isActive: contact.isActive ?? true,
      notes: contact.notes || '',
    });
    setContactToAction(contact);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      showError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (contactToAction) {
        await medicalContactsAPI.update(contactToAction._id, formData);
        success('تم تحديث جهة الاتصال بنجاح');
      } else {
        await medicalContactsAPI.create(formData);
        success('تمت إضافة جهة الاتصال بنجاح');
      }
      setShowModal(false);
      loadContacts();
      loadStats();
    } catch (error) {
      showError(contactToAction ? 'فشل تحديث جهة الاتصال' : 'فشل إضافة جهة الاتصال');
    }
  };

  const handleDelete = async () => {
    if (!contactToAction) return;

    try {
      await medicalContactsAPI.delete(contactToAction._id);
      success('تم حذف جهة الاتصال بنجاح');
      setShowDeleteDialog(false);
      setContactToAction(null);
      loadContacts();
      loadStats();
    } catch (error) {
      showError('فشل حذف جهة الاتصال');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospital': return 'fa-hospital';
      case 'clinic': return 'fa-clinic-medical';
      case 'doctor': return 'fa-user-md';
      default: return 'fa-phone';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospital': return 'مستشفى';
      case 'clinic': return 'عيادة';
      case 'doctor': return 'طبيب';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hospital': return 'bg-red-500/20 text-red-500';
      case 'clinic': return 'bg-blue-500/20 text-blue-500';
      case 'doctor': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <AdminLayout title="إدارة جهات الاتصال الطبية">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <AnimatedItem type="slideUp" delay={0.1}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                <i className="fas fa-phone-alt text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stats.total}</h3>
            <p className="text-sm text-[var(--text-secondary)]">إجمالي الجهات</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.2}>
          <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
                <i className="fas fa-hospital text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-red-500 mb-1">{stats.hospitals}</h3>
            <p className="text-sm text-red-500/80">مستشفيات</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.3}>
          <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                <i className="fas fa-clinic-medical text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-blue-500 mb-1">{stats.clinics}</h3>
            <p className="text-sm text-blue-500/80">عيادات</p>
          </div>
        </AnimatedItem>

        <AnimatedItem type="slideUp" delay={0.4}>
          <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                <i className="fas fa-user-md text-xl"></i>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-green-500 mb-1">{stats.doctors}</h3>
            <p className="text-sm text-green-500/80">أطباء</p>
          </div>
        </AnimatedItem>
      </div>

      {/* Search and Filter */}
      <AnimatedItem type="slideUp" delay={0.5}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث..."
                className="flex-1 px-4 py-2 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
              />
              <button type="submit" className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
                <i className="fas fa-search"></i>
              </button>
            </form>

            <div className="flex gap-2">
              {[
                { id: 'all', label: 'الكل', count: stats.total },
                { id: 'hospital', label: 'مستشفيات', count: stats.hospitals },
                { id: 'clinic', label: 'عيادات', count: stats.clinics },
                { id: 'doctor', label: 'أطباء', count: stats.doctors },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === filter.id
                      ? 'bg-[var(--primary-color)] text-white shadow-lg'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  {filter.label}
                  <span className="mr-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{filter.count}</span>
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> إضافة
            </button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="mt-4 flex items-center justify-between px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <span className="text-blue-500 font-medium">
                <i className="fas fa-check-circle ml-1"></i>
                تم اختيار {selectedIds.length} جهة اتصال
              </span>
              <button
                onClick={() => setShowBulkDeleteDialog(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-trash"></i>
                حذف المحدد
              </button>
            </div>
          )}
        </div>
      </AnimatedItem>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
        </div>
      ) : contacts.length === 0 ? (
        <AnimatedItem type="slideUp" delay={0.6}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
            <i className="fas fa-phone-alt text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد جهات اتصال</h3>
            <p className="text-[var(--text-secondary)]">ابدأ بإضافة جهة اتصال جديدة</p>
          </div>
        </AnimatedItem>
      ) : (
        <AnimatedItem type="slideUp" delay={0.6}>
          <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
            {/* Counter bar */}
            <div className="px-6 py-3 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">
                عرض {contacts.length} من أصل {pagination.total || contacts.length} جهة اتصال
              </span>
              <span className="text-[var(--text-secondary)]">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <tr>
                    <th className="px-6 py-4 text-center text-sm font-bold text-[var(--text-primary)] w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === contacts.length && contacts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">النوع</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">البريد</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">العنوان</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]/30">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className={`hover:bg-[var(--bg-secondary)]/50 transition-colors ${
                      selectedIds.includes(contact._id) ? 'bg-blue-500/10' : ''
                    }`}>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(contact._id)}
                          onChange={() => toggleSelect(contact._id)}
                          className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)] cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(contact.type)}`}>
                          <i className={`fas ${getTypeIcon(contact.type)} ml-1`}></i>
                          {getTypeLabel(contact.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{contact.name}</td>
                      <td className="px-6 py-4 text-[var(--text-primary)]" style={{ direction: 'ltr' }}>{contact.phone}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{contact.email}</td>
                      <td className="px-6 py-4 text-[var(--text-secondary)] text-sm">{contact.address}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${contact.isActive ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                          {contact.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(contact)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => {
                              setContactToAction(contact);
                              setShowDeleteDialog(true);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 px-6 py-4 border-t border-[var(--border-color)]/30">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-[var(--primary-color)] text-white'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </AnimatedItem>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--border-color)]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {contactToAction ? 'تحديث جهة الاتصال' : 'إضافة جهة اتصال جديدة'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-[var(--text-secondary)]"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    الاسم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    النوع <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  >
                    <option value="hospital">مستشفى</option>
                    <option value="clinic">عيادة</option>
                    <option value="doctor">طبيب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    الهاتف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">
                    العنوان <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[var(--text-primary)] font-medium mb-2">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors resize-vertical text-[var(--text-primary)] bg-[var(--bg-primary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    />
                    <span className="text-[var(--text-primary)] font-medium">نشط</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold hover:bg-[var(--primary-hover)] transition-colors"
                >
                  {contactToAction ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:bg-[var(--bg-primary)] transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="حذف جهة الاتصال"
        message={`هل أنت متأكد من حذف "${contactToAction?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setContactToAction(null);
        }}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        isOpen={showBulkDeleteDialog}
        title="حذف جهات الاتصال المحددة"
        message={`هل أنت متأكد من حذف ${selectedIds.length} جهة اتصال؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف المحدد"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleBulkDelete}
        onCancel={() => {
          setShowBulkDeleteDialog(false);
        }}
      />
    </AdminLayout>
  );
};

export default AdminMedicalContacts;
