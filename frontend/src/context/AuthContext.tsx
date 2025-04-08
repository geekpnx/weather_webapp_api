// frontend/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { fetchUserProfile } from '../api/user';
import { UserProfileData } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null; // Add authToken to the context type
  userProfile: UserProfileData | null;
  login: () => void;
  logout: () => void;
  refreshProfile: (force?: boolean) => Promise<void>;
  updateFavorites: (newFavorites: string[]) => void;
  updateUserContext: (profileData: Partial<UserProfileData>) => void; // Add this line
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('auth_token')
  );
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('auth_token')); // Add authToken state
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setAuthToken(null); // Clear authToken on logout
    setUserProfile(null);
  }, []);

  const refreshProfile = useCallback(async (force: boolean = false): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      logout();
      return;
    }
    setAuthToken(token); // Ensure authToken is updated on refresh

    try {
      if (force || !userProfile) {
        const profile = await fetchUserProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
      logout();
    }
  }, [userProfile, logout]);

  const login = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      logout();
      return;
    }
    setIsAuthenticated(true);
    setAuthToken(token); // Set authToken on login
    refreshProfile(true);
  }, [refreshProfile, logout]);

  const updateFavorites = useCallback((newFavorites: string[]) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        favorite_locations: newFavorites
      };
    });
  }, []);

  const updateUserContext = useCallback((profileData: Partial<UserProfileData>) => {
    setUserProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...profileData,
      };
    });
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
        if (!userProfile) {
          try {
            await refreshProfile(true);
          } catch (error) {
            console.error('Authentication check failed:', error);
            logout();
          }
        }
      } else {
        setIsAuthenticated(false);
        setAuthToken(null);
        setUserProfile(null);
      }
    };
    checkAuth();
  }, [refreshProfile, logout, userProfile]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authToken, // Include authToken in the context value
      userProfile,
      login,
      logout,
      refreshProfile,
      updateFavorites,
      updateUserContext // Include updateUserContext in the context value
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