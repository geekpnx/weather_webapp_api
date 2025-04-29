import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUserPreferences } from '../api/user';

interface PreferencesContextType {
  temperatureUnit: 'C' | 'F';
  theme: 'light' | 'dark';
  toggleTemperatureUnit: () => void;
  toggleTheme: () => void;
  convertTemp: (temp: number) => number;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userProfile, refreshProfile } = useAuth();
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      if (userProfile.preferred_temperature_unit) {
        setTemperatureUnit(userProfile.preferred_temperature_unit);
      }
      if (userProfile.preferred_theme) {
        // Add type validation
        const validTheme = userProfile.preferred_theme === 'dark' ? 'dark' : 'light';
        setTheme(validTheme);
        document.body.setAttribute('data-theme', validTheme);
      }
    }
  }, [isAuthenticated, userProfile]);

  
  // Set theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;

  const convertTemp = (temp: number): number => {
    return temperatureUnit === 'F' ? celsiusToFahrenheit(temp) : temp;
  };

  const toggleTemperatureUnit = async () => {
    const newUnit = temperatureUnit === 'C' ? 'F' : 'C';
    setTemperatureUnit(newUnit);
    
    if (isAuthenticated) {
      try {
        await updateUserPreferences({ 
          preferred_temperature_unit: newUnit,
          preferred_theme: theme // Keep current theme when updating temp unit
        });
        refreshProfile?.();
      } catch (error) {
        console.error('Failed to update temperature unit:', error);
      }
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (isAuthenticated) {
      try {
        await updateUserPreferences({ 
          preferred_theme: newTheme,
          preferred_temperature_unit: temperatureUnit // Keep current temp unit
        });
        refreshProfile?.();
      } catch (error) {
        console.error('Failed to update theme:', error);
        // Revert if API call fails
        setTheme(theme);
        document.body.setAttribute('data-theme', theme);
      }
    }
  };

  return (
    <PreferencesContext.Provider value={{ 
      temperatureUnit, 
      theme,
      toggleTemperatureUnit, 
      toggleTheme,
      convertTemp 
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};