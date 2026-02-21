import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api.js';

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

  useEffect(() => {
    // Check if user is logged in on initial load
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedToken) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);

        try {
          // Attempt to get user profile to verify token validity
          const profile = await authAPI.getProfile();
          // Convert relative avatar URL to full URL
          if (profile.avatar && profile.avatar.startsWith('/')) {
            profile.avatar = `http://localhost:4000${profile.avatar}`;
          }
          setUser(profile);
        } catch (error) {
          // Token is invalid, try to refresh
          if (storedRefreshToken) {
            try {
              const newToken = await authAPI.refreshToken(storedRefreshToken);
              localStorage.setItem('token', newToken.access_token);
              setToken(newToken.access_token);

              // Try getting profile again with new token
              const profile = await authAPI.getProfile();
              // Convert relative avatar URL to full URL
              if (profile.avatar && profile.avatar.startsWith('/')) {
                profile.avatar = `http://localhost:4000${profile.avatar}`;
              }
              setUser(profile);
            } catch (refreshError) {
              // Refresh failed, clear tokens
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              setToken(null);
              setRefreshToken(null);
            }
          } else {
            // No refresh token, clear everything
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, refresh_token, user: userData } = response;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setToken(access_token);
      setRefreshToken(refresh_token);
      
      // Convert relative avatar URL to full URL
      if (userData.avatar && userData.avatar.startsWith('/')) {
        userData.avatar = `http://localhost:4000${userData.avatar}`;
      }
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Auto-login after registration if token is provided
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        setToken(response.access_token);
        setUser(response.user || { email: userData.email, firstName: userData.firstName, lastName: userData.lastName });
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
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const updateUserAvatar = (avatarUrl) => {
    setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
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
    isAuthenticated: !!user && !loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};