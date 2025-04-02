import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { fetchUserProfile } from '../api/user';
import { UserProfileData } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfileData | null;
  login: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('auth_token')
  );
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      const profile = await fetchUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
      logout();
    }
  }, []);

  const login = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      logout();
      return;
    }
    setIsAuthenticated(true);
    refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUserProfile(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated && !userProfile) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Authentication check failed:', error);
          logout();
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, userProfile, refreshProfile, logout]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated,
      userProfile,
      login,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};