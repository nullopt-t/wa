import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api.js';

import { API_URL } from '../config.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Skip if already initialized
    if (initialized) return;

    // Check if user is logged in on initial load
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      // No token - not logged in
      if (!storedToken) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      // Check if we already have user data in localStorage (optimistic loading)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoading(false);
          setInitialized(true);
          
          // Verify token in background (don't block UI)
          authAPI.getProfile().then(profile => {
            if (profile.avatar && profile.avatar.startsWith('/')) {
              profile.avatar = `${API_URL}${profile.avatar}`;
            }
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          }).catch(() => {
            // Token invalid, clear cache
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
          });
          
          return;
        } catch (e) {
          // Invalid cached user, continue with normal flow
          localStorage.removeItem('user');
        }
      }

      // Normal flow - verify token with server
      try {
        const profile = await authAPI.getProfile();
        if (profile.avatar && profile.avatar.startsWith('/')) {
          profile.avatar = `${API_URL}${profile.avatar}`;
        }
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        // Token is invalid, try to refresh
        if (storedRefreshToken) {
          try {
            const newToken = await authAPI.refreshToken(storedRefreshToken);
            localStorage.setItem('token', newToken.access_token);
            setToken(newToken.access_token);

            const profile = await authAPI.getProfile();
            if (profile.avatar && profile.avatar.startsWith('/')) {
              profile.avatar = `${API_URL}${profile.avatar}`;
            }
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          } catch (refreshError) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setToken(null);
            setRefreshToken(null);
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }

      setLoading(false);
      setInitialized(true);
    };

    initializeAuth();
  }, [initialized]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token, user: userData } = response;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setToken(access_token);
      setRefreshToken(refresh_token);

      // Handle avatar URL if present
      if (userData && userData.avatar && userData.avatar.startsWith('/')) {
        userData.avatar = `${API_URL}${userData.avatar}`;
      }
      setUser(userData || {});
      localStorage.setItem('user', JSON.stringify(userData || {}));

      return { success: true, user: userData || {} };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        setToken(response.access_token);
        const userObj = response.user || { email: userData.email, firstName: userData.firstName, lastName: userData.lastName };
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      return { success: true, user: response };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setInitialized(false);
  };

  const updateUserAvatar = (avatarUrl) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, avatar: avatarUrl };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // Make updateUserAvatar available globally for profile page
  if (typeof window !== 'undefined') {
    window.updateUserAvatar = updateUserAvatar;
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUserAvatar,
    loading,
    isAuthenticated: !!user,
    initialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};