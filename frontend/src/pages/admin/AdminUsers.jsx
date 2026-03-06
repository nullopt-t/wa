import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import EditUserModal from '../../components/admin/EditUserModal.jsx';
import AdminFilters from '../../components/admin/AdminFilters.jsx';
import { usersAPI } from '../../services/communityApi.js';

const AdminUsers = () => {
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [sortColumn, setSortColumn] = useState('createdAt'); // Column to sort by
  const [sortDirection, setSortDirection] = useState('desc'); // asc or desc
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getAll();
      // Handle different API response structures
      const usersList = data.users || data.data || data;
      setUsers(Array.isArray(usersList) ? usersList : []);
    } catch (error) {
      showError('فشل تحميل المستخدمين');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleEditSave = async (updatedData) => {
    try {
      await usersAPI.update(userToEdit._id, updatedData);
      success('تم تحديث المستخدم بنجاح');
      setShowEditModal(false);
      setUserToEdit(null);
      loadUsers();
    } catch (error) {
      showError('فشل تحديث المستخدم');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setUserToEdit(null);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await usersAPI.delete(userToDelete._id);
      success('تم حذف المستخدم بنجاح');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      showError('فشل حذف المستخدم');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) return 'fa-sort text-gray-400';
    return sortDirection === 'asc' ? 'fa-sort-up text-[var(--primary-color)]' : 'fa-sort-down text-[var(--primary-color)]';
  };

  const handleFilterChange = (key, value) => {
    if (key === 'role') {
      setFilterRole(value);
    } else if (key === 'status') {
      setFilterStatus(value);
    }
  };

  const handleClearFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
    setSearchTerm('');
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;

    const email = user.email?.toLowerCase() || '';
    const firstName = user.firstName?.toLowerCase() || '';
    const lastName = user.lastName?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();

    const matchesSearch = email.includes(searchTermLower) ||
      firstName.includes(searchTermLower) ||
      lastName.includes(searchTermLower);

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive !== false) ||
      (filterStatus === 'inactive' && user.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    // Sorting logic
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];

    // Handle name sorting (firstName + lastName)
    if (sortColumn === 'name') {
      aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
      bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
    }

    // Handle email sorting
    if (sortColumn === 'email') {
      aValue = (a.email || '').toLowerCase();
      bValue = (b.email || '').toLowerCase();
    }

    // Handle boolean sorting (isActive)
    if (sortColumn === 'isActive') {
      aValue = a.isActive !== false ? 1 : 0;
      bValue = b.isActive !== false ? 1 : 0;
    }

    // Handle role sorting
    if (sortColumn === 'role') {
      aValue = (a.role || '').toLowerCase();
      bValue = (b.role || '').toLowerCase();
    }

    // Handle dates
    if (sortColumn === 'createdAt') {
      aValue = new Date(a.createdAt || 0);
      bValue = new Date(b.createdAt || 0);
    }

    let comparison = 0;
    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getRoleBadgeColor = (role) => {
    const safeRole = role || 'user';
    switch (safeRole) {
      case 'admin': return 'bg-red-500/20 text-red-500';
      case 'therapist': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-green-500/20 text-green-500';
    }
  };

  return (
    <AdminLayout title="إدارة المستخدمين">
      {/* Filters */}
      <AdminFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="البريد الإلكتروني، الاسم..."
        filters={[
          {
            key: 'role',
            label: 'تصفية حسب الدور',
            value: filterRole,
            options: [
              { value: 'all', label: 'الكل' },
              { value: 'admin', label: 'مدير' },
              { value: 'therapist', label: 'معالج' },
              { value: 'user', label: 'مستخدم' },
            ],
          },
          {
            key: 'status',
            label: 'تصفية حسب الحالة',
            value: filterStatus,
            options: [
              { value: 'all', label: 'الكل' },
              { value: 'active', label: 'نشط ✅' },
              { value: 'inactive', label: 'غير نشط ❌' },
            ],
          },
        ]}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalItems={users.length}
        filteredItems={filteredUsers.length}
      />

      {/* Users Table */}
      <AnimatedItem type="slideUp" delay={0.2}>
        <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)]">
                <tr>
                  <th 
                    className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <i className={`fas ${getSortIcon('name')} ml-2`}></i>
                    المستخدم
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <i className={`fas ${getSortIcon('role')} ml-2`}></i>
                    الدور
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                    onClick={() => handleSort('isActive')}
                  >
                    <i className={`fas ${getSortIcon('isActive')} ml-2`}></i>
                    الحالة
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-primary)] transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <i className={`fas ${getSortIcon('createdAt')} ml-2`}></i>
                    تاريخ الانضمام
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-[var(--text-primary)]">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)] mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--text-secondary)]">
                      لا يوجد مستخدمين
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    // Safely get user fields with fallbacks
                    const userId = user._id || user.id || 'unknown';
                    const firstName = user.firstName || '';
                    const lastName = user.lastName || '';
                    const email = user.email || 'لا يوجد بريد';
                    const role = user.role || 'user';
                    const isActive = user.isActive !== false;
                    const createdAt = user.createdAt;
                    const avatar = user.avatar;
                    
                    const displayName = firstName && lastName ? `${firstName} ${lastName}` : (email.split('@')[0] || 'مستخدم');
                    const initial = (firstName.charAt(0) || email.charAt(0) || 'U').toUpperCase();

                    return (
                      <tr key={userId} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] flex items-center justify-center text-white font-bold flex-shrink-0">
                              {avatar ? (
                                <img src={avatar.startsWith('/') ? `http://localhost:4000${avatar}` : avatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                initial
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)]">{displayName}</p>
                              <p className="text-sm text-[var(--text-secondary)]">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getRoleBadgeColor(role)}`}>
                            {role === 'admin' ? 'مدير' : role === 'therapist' ? 'معالج' : 'مستخدم'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm text-[var(--text-secondary)]">
                              {isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {createdAt ? new Date(createdAt).toLocaleDateString('ar-EG') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedItem>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف المستخدم ${userToDelete?.firstName || userToDelete?.email}؟\n\nهذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Edit User Modal */}
      {showEditModal && userToEdit && (
        <EditUserModal
          user={userToEdit}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
