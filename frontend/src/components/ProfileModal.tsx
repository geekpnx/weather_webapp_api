import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../assets/css/ProfileModal.css';
import {
  fetchUserProfile,
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
  const { logout, refreshProfile } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [password, setPassword] = useState('');
  const { triggerProfileUpdate } = useProfile();
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
    if (isOpen) loadProfile();
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      setUserData(data);
      setError('');
    } catch (error) {
      setError('Failed to load profile');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    try {
      console.log('Uploading file:', file.name, file.size, file.type); 
      await uploadProfilePicture(file);
      triggerProfileUpdate();
      await loadProfile();
      setSuccess('Profile picture updated');
      setError('');
      refreshProfile();
    } catch (error) {
      console.error('Upload error:', error); 
      setError('Failed to upload image');
    }
  };
  

  const handleRemovePicture = async () => {
    try {
      await removeProfilePicture();
      triggerProfileUpdate(); 
      await loadProfile();
      setSuccess('Profile picture removed successfully');
      setError('');
      refreshProfile(); 
    } catch (error) {
      setError(error instanceof Error ? 
        error.message : 
        'Failed to remove profile picture'
      );
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
      await loadProfile();
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

        <div className="modal-tabs">
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

        {activeTab === 'profile' && userData && (
          <form onSubmit={handleUpdateProfile} className="tab-content">

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
            {/* Temperature Unit Row */}
            <div className="preference-row">
              <label className="preference-label">Preferred Unit</label>
              <div className="toggle-container">
                <div className="temperature-toggle">
                  <span className={`unit ${temperatureUnit === 'C' ? 'active' : ''}`}>°C</span>
                  <button
                    type="button"
                    className={`toggle-button ${temperatureUnit === 'F' ? 'active' : ''}`}
                    onClick={toggleTemperatureUnit}
                  >
                    <div className="toggle-switch">
                      <div className="toggle-knob" />
                    </div>
                  </button>
                  <span className={`unit ${temperatureUnit === 'F' ? 'active' : ''}`}>°F</span>
                </div>
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
  );
};

export default ProfileModal;