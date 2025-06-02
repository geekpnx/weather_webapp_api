import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile } from '../api/user';

type ProfileContextType = {
  profileVersion: number;
  profileData: any;
  triggerProfileUpdate: () => void;
  refreshProfileData: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType>({
  profileVersion: 0,
  profileData: null,
  triggerProfileUpdate: () => {},
  refreshProfileData: async () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileVersion, setProfileVersion] = useState(0);
  const [profileData, setProfileData] = useState<any>(null);

  const refreshProfileData = async () => {
    try {
      const data = await fetchUserProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Failed to refresh profile data:', error);
    }
  };

  const triggerProfileUpdate = () => {
    setProfileVersion(v => v + 1);
    refreshProfileData(); // Refresh the actual data when triggered
  };

  // Initial load
  useEffect(() => {
    refreshProfileData();
  }, []);

  return (
    <ProfileContext.Provider value={{ 
      profileVersion, 
      profileData,
      triggerProfileUpdate,
      refreshProfileData 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);