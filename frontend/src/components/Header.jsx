import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsDropdown && !event.target.closest('.relative')) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSettingsDropdown]);

  // Prevent scrolling on the main page when sidebar is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-md sticky top-0 z-[60] border-b border-[var(--border-color)]/30">
      <nav className="py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/">
              <img src="/logo192.png" alt="منصة وعي" className="h-12 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex space-x-8">
            <Link to="/" className={`font-medium ${location.pathname === '/' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>الرئيسية</Link>
            <Link to="/categories" className={`font-medium ${location.pathname === '/categories' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>الأقسام</Link>
            <Link to="/about" className={`font-medium ${location.pathname === '/about' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>عن وعي</Link>
            <Link to="/contact" className={`font-medium ${location.pathname === '/contact' ? 'text-[#c5a98e]' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] transition-colors`}>تواصل معنا</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="text-[var(--text-primary)] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <i className="fas fa-times text-2xl"></i>
              ) : (
                <i className="fas fa-bars text-2xl"></i>
              )}
            </button>
          </div>

          <div className="hidden xl:flex space-x-3 items-center">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative">
                <span className="text-[var(--text-primary)] ml-4">مرحباً، {user?.firstName || user?.email}</span>
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
                >
                  الإعدادات <i className="fas fa-chevron-down mr-1"></i>
                </button>
                {showSettingsDropdown && (
                  <div className="absolute left-0 mt-2 w-56 bg-[var(--bg-secondary)] rounded-xl shadow-xl border border-[var(--border-color)] overflow-hidden z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <i className="fas fa-th-large ml-2"></i>لوحة التحكم
                    </Link>
                    <Link
                      to="/profile-settings"
                      className="block px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors border-t border-[var(--border-color)]"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <i className="fas fa-user ml-2"></i>الملف الشخصي
                    </Link>
                    <Link
                      to="/account-settings"
                      className="block px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors border-t border-[var(--border-color)]"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <i className="fas fa-cog ml-2"></i>إعدادات الحساب
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full text-right px-4 py-3 text-red-500 hover:bg-red-500/10 transition-colors border-t border-[var(--border-color)]"
                    >
                      <i className="fas fa-sign-out-alt ml-2"></i>تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[#4a5d5e] hover:text-white transition-colors">
                  تسجيل دخول
                </Link>
                <Link to="/signup" className="px-4 py-2 bg-[#3d5a5a] text-white rounded-lg font-medium hover:bg-[#2c4a4a] transition-colors">
                  انضم إلينا
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-40 bg-[var(--bg-primary)] bg-opacity-90 flex xl:hidden">
            <div
              className="bg-[var(--bg-secondary)]/90 backdrop-blur-md w-64 h-screen overflow-y-auto border-r border-[var(--border-color)]/30 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex justify-between items-center p-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  <img src="/logo192.png" alt="منصة وعي" className="h-10 w-auto" />
                </Link>
                <button
                  onClick={toggleMenu}
                  className="text-[var(--text-primary)] focus:outline-none"
                  aria-label="Close menu"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="px-6 pb-6 flex flex-col space-y-6">
                <Link
                  to="/"
                  className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  الرئيسية
                </Link>
                <Link
                  to="/categories"
                  className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/categories' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  الأقسام
                </Link>
                <Link
                  to="/about"
                  className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/about' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  عن وعي
                </Link>
                <Link
                  to="/contact"
                  className={`font-medium py-3 px-4 rounded-lg ${location.pathname === '/contact' ? 'text-[#c5a98e] bg-[var(--bg-primary)]/50' : 'text-[var(--text-primary)]'} hover:text-[#c5a98e] hover:bg-[var(--bg-primary)]/30 transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  تواصل معنا
                </Link>
                <div className="pt-6 flex flex-col space-y-4">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 bg-[var(--bg-primary)]/50 rounded-lg font-medium text-center">
                        مرحباً، {user?.firstName || user?.email}
                      </div>
                      <Link
                        to="/dashboard"
                        className="px-4 py-3 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-th-large ml-2"></i>لوحة التحكم
                      </Link>
                      <Link
                        to="/profile-settings"
                        className="px-4 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-primary)] transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-user ml-2"></i>الملف الشخصي
                      </Link>
                      <Link
                        to="/account-settings"
                        className="px-4 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--bg-primary)] transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-cog ml-2"></i>إعدادات الحساب
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                          setIsMenuOpen(false);
                        }}
                        className="px-4 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors text-center"
                      >
                        <i className="fas fa-sign-out-alt ml-2"></i>تسجيل خروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="px-4 py-3 border-2 border-[var(--border-color)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[#4a5d5e] hover:text-white transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        تسجيل دخول
                      </Link>
                      <Link
                        to="/signup"
                        className="px-4 py-3 bg-[#3d5a5a] text-white rounded-lg font-medium hover:bg-[#2c4a4a] transition-colors text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        انضم إلينا
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;