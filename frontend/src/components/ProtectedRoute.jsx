import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles = [], redirectPath = '/login' }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Serialize to avoid new array reference on every render
  const allowedRolesKey = allowedRoles.join(',');

  useEffect(() => {
    if (loading) return; // Wait until auth resolves

    if (!isAuthenticated) {
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate(redirectPath, { state: { from: location }, replace: true });
      }
      return;
    }

    if (allowedRolesKey && user?.role && !allowedRolesKey.split(',').includes(user.role)) {
      navigate(user.role === 'therapist' ? '/therapist/dashboard' : '/user-dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, user?.role, allowedRolesKey, navigate, location.pathname, redirectPath]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (allowedRolesKey && user?.role && !allowedRolesKey.split(',').includes(user.role)) return null;

  return children;
};

export default ProtectedRoute;