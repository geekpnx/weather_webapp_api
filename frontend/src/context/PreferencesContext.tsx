import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUserPreferences } from '../api/user';

// 1. Create the context with proper typing
const PreferencesContext = createContext<{
  temperatureUnit: 'C' | 'F';
  toggleTemperatureUnit: () => void;
  convertTemp: (temp: number) => number;
} | null>(null); // Initialize with null

// 2. Create the provider component
export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userProfile, refreshProfile } = useAuth();
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');

  useEffect(() => {
    if (isAuthenticated && userProfile?.preferred_temperature_unit) {
      setTemperatureUnit(userProfile.preferred_temperature_unit);
    }
  }, [isAuthenticated, userProfile?.preferred_temperature_unit]);

  const celsiusToFahrenheit = (c: number): number => (c * 9/5) + 32;

  const convertTemp = (temp: number): number => {
    return temperatureUnit === 'F' ? celsiusToFahrenheit(temp) : temp;
  };

  const toggleTemperatureUnit = async () => {
    const newUnit = temperatureUnit === 'C' ? 'F' : 'C';
    setTemperatureUnit(newUnit);
    
    if (isAuthenticated) {
      try {
        await updateUserPreferences({ preferred_temperature_unit: newUnit });
        refreshProfile?.();
      } catch (error) {
        console.error('Failed to update temperature unit:', error);
      }
    }
  };

  return (
    <PreferencesContext.Provider value={{ temperatureUnit, toggleTemperatureUnit, convertTemp }}>
      {children}
    </PreferencesContext.Provider>
  );
};

// 3. Create a custom hook with proper null check
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};