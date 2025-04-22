import React, { createContext, useContext, useState } from 'react';

type ProfileContextType = {
  profileVersion: number;
  triggerProfileUpdate: () => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profileVersion: 0,
  triggerProfileUpdate: () => {},
});

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profileVersion, setProfileVersion] = useState(0);

  const triggerProfileUpdate = () => {
    setProfileVersion(v => v + 1);
  };

  return (
    <ProfileContext.Provider value={{ profileVersion, triggerProfileUpdate }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);