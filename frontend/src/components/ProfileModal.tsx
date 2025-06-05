import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/ProfileModal.css';
import {
  deleteAccount,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
} from '../api/user';

import { sanitizeImageUrl } from '../utils/utils';
import { useProfile } from '../context/ProfileContext';
import { usePreferences } from '../context/PreferencesContext';
import { ProfileModalProps } from '../types/types'


const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile'  }) => {
  const { logout } = useAuth();
   const { profileData: contextProfileData, refreshProfileData } = useProfile();
  const [userData, setUserData] = useState<any>(contextProfileData);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [password, setPassword] = useState('');
  const { profileVersion } = useProfile();
  const { temperatureUnit, toggleTemperatureUnit } = usePreferences();
  
  const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL;
  const defaultProPic = `${STATIC_BASE_URL}/images/propic/user_propic.svg`;
  const isDefaultImage = () => {
    if (!userData?.profile_picture) return true;
    
    const extractPath = (url: string) => url.split('/').slice(3).join('/');
    return extractPath(userData.profile_picture) === extractPath(defaultProPic);
  };


  useEffect(() => {
    if (isOpen) {
      refreshProfileData();
    }
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    setUserData(contextProfileData);
  }, [contextProfileData]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadProfilePicture(file);
      await refreshProfileData(); // Use the context refresh function
      setSuccess('Profile picture updated');
      setError('');
    } catch (error) {
      setError('Failed to upload image');
    }
  };
  

  const handleRemovePicture = async () => {
    try {
      await removeProfilePicture();
      await refreshProfileData(); // Use the context refresh function
      setSuccess('Profile picture removed successfully');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove profile picture');
    }
  };
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (success) {
      timer = setTimeout(() => {
        setSuccess('');
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (error) {
      timer = setTimeout(() => {
        setError('');
      }, 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = {
        user: {
          username: userData.user.username,
          email: userData.user.email,
          first_name: userData.user.first_name,
          last_name: userData.user.last_name
        },
        profile_picture: userData.profile_picture,
        location: userData.location,
        preferred_temperature_unit: userData.preferred_temperature_unit,
        preferred_theme: userData.preferred_theme,
      };
  
      await updateUserProfile(updateData);
      setSuccess('Profile updated successfully');
      await refreshProfileData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };


  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    try {
      await deleteAccount(password);
      logout();
      onClose();
    } catch (error) {
      setError('Failed to delete account. Check your password.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <button className="close-button" onClick={onClose}>×</button>

        <div className="profile-picture-section">
          <div className="profile-picture-container">
          <img 
            src={`${sanitizeImageUrl(userData?.profile_picture, defaultProPic)}?v=${profileVersion}`}
            alt="Profile"
            className="profile-picture"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `${defaultProPic}?v=${profileVersion}`;
            }}
            key={`profile-pic-${userData?.profile_picture ? 'custom' : 'default'}-${profileVersion}`}
          />
            <div className="picture-control-overlay">
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleFileUpload}
                hidden
              />
              {!isDefaultImage() ? (
                <button onClick={handleRemovePicture} className="btn-remove">
                  −
                </button>
              ) : (
                <label htmlFor="profile-upload" className="btn-upload">
                  +
                </label>
              )}
            </div>
          </div>
        </div>

        <div className={`modal-tabs ${activeTab === 'settings' ? 'settings-active' : ''}`}>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={activeTab === 'profile' ? 'active' : ''}
          >
            Profile
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={activeTab === 'settings' ? 'active' : ''}
          >
            Settings
          </button>
        </div>

        <div className="message-container">
          {success && (
            <div className="success-message show">
              {success}
            </div>
          )}
          {error && (
            <div className="error-message show">
              {error}
            </div>
          )}
        </div>

      <div className="modal-content">
        {activeTab === 'profile' && userData && (
          <form onSubmit={handleUpdateProfile} className="tab-content">


            <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={userData.user.username}
              readOnly
              className="read-only-input" // Optional: for styling
            />
          </div>

            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={userData.user.first_name || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  user: {...userData.user, first_name: e.target.value}
                })}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={userData.user.last_name || ''}
                onChange={(e) => setUserData({
                  ...userData,
                  user: {...userData.user, last_name: e.target.value}
                })}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userData.user.email}
                onChange={(e) => setUserData({
                  ...userData,
                  user: {...userData.user, email: e.target.value}
                })}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={userData.location}
                onChange={(e) => setUserData({
                  ...userData,
                  location: e.target.value
                })}
              />
            </div>
            
            <button type="submit" className="btn-save">Save Changes</button>
          </form>
        )}

        {activeTab === 'settings' && userData && (
          <div className="settings-content">
            <div className="preference-row">
              <div className="switch-container">
                <span className="switch-label">Temp. Unit:</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={temperatureUnit === 'F'}
                    onChange={toggleTemperatureUnit}
                  />
                  <span className="slider">
                    <span className="unit-text left">°C</span>
                    <span className="unit-text right">°F</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
        <div className="danger-zone">
          <h3>Delete Account</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="username"
              autoComplete="username"
              className="visually-hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                name="current-password" 
                placeholder="Enter password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
              <button 
                onClick={handleDeleteAccount} 
                className="btn-delete"
                type="submit"
              >
                Delete Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;