// components/ProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../../../static/css/ProfileModal.css';
import {
  fetchUserProfile,
  deleteAccount,
  updateUserProfile,
  uploadProfilePicture,
  removeProfilePicture,
  updatePreferences,
} from '../api/user';



interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'settings';  // Add this prop
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile'  }) => {
  const { logout, refreshProfile } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(initialTab);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [password, setPassword] = useState('');
  const isDefaultImage = () => {
  const defaultImageUrl = 'http://127.0.0.1:8000/static/images/propic/user_propic.svg';
    return !userData?.profile_picture || userData.profile_picture === defaultImageUrl;
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
      await uploadProfilePicture(file);
      await loadProfile();
      setSuccess('Profile picture updated');
      setError('');
      refreshProfile(); // Add this from useAuth context
    } catch (error) {
      setError('Failed to upload image');
    }
  };
  

  const handleRemovePicture = async () => {
    try {
      await removeProfilePicture();
      await loadProfile();
      setSuccess('Profile picture removed successfully');
      setError('');
      refreshProfile(); // Add this from useAuth context
    } catch (error) {
      setError(error instanceof Error ? 
        error.message : 
        'Failed to remove profile picture'
      );
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000); // Message will disappear after 3 seconds (3000ms)
  
      // Clear timeout when component unmounts or before setting new success message
      return () => clearTimeout(timer);
    }
  }, [success]);  

  // Add similar useEffect for errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000); // Errors stay longer (5 seconds)

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare the data in the correct format
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
  
      // Use the updateUserProfile API function
      await updateUserProfile(updateData);
      setSuccess('Profile updated successfully');
      await loadProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };



  const handlePreferencesUpdate = async () => {
    try {
      // Check if preferences actually changed
      const originalData = await fetchUserProfile();
      const prefsChanged = 
        originalData.preferred_temperature_unit !== userData.preferred_temperature_unit ||
        originalData.preferred_theme !== userData.preferred_theme;

      if (!prefsChanged) {
        setSuccess('No changes to save');
        return;
      }

      await updatePreferences({
        preferred_temperature_unit: userData.preferred_temperature_unit,
        preferred_theme: userData.preferred_theme,
      });
      setSuccess('Preferences updated successfully');
      await loadProfile(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error instanceof Error ?  error.message : 'Failed to update preferences');
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

        {success && (
          <div className="global-message success">
            {success}
          </div>
        )}

        {error && (
          <div className="global-message error">
            {error}
          </div>
        )}

        {/* Profile Picture Section - Now outside tabs */}
        <div className="profile-picture-section">
          <div className="profile-picture-container">
            <img 
              src={userData?.profile_picture }
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'http://127.0.0.1:8000/static/images/propic/user_propic.svg';
              }}
              key={userData?.profile_picture ? `${userData.profile_picture}?ts=${Date.now()}` : 'default'}
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

        {/* Tabs under profile picture */}
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


        {/* Profile Tab Content */}
        {activeTab === 'profile' && userData && (
          <form onSubmit={handleUpdateProfile} className="tab-content">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={userData.user.username}
                onChange={(e) => setUserData({
                  ...userData,
                  user: {...userData.user, username: e.target.value}
                })}
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

        {/* Settings Tab Content */}
        {activeTab === 'settings' && userData && (
          <div className="settings-content">
            <div className="form-group">
              <label>Temperature Unit</label>
              <select
                value={userData.preferred_temperature_unit}
                onChange={(e) => setUserData({
                  ...userData,
                  preferred_temperature_unit: e.target.value
                })}
              >
                <option value="C">Celsius</option>
                <option value="F">Fahrenheit</option>
              </select>
            </div>

            <div className="form-group">
              <label>Theme</label>
              <select
                value={userData.preferred_theme}
                onChange={(e) => setUserData({
                  ...userData,
                  preferred_theme: e.target.value
                })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>


            {/* Add Save button for Settings */}
            <button 
              onClick={handlePreferencesUpdate} 
              className="btn-save"
            >
              Save Preferences
            </button>
          </div>
        )}

        {/* Danger Zone - Moved outside tabs */}
        <div className="danger-zone">
          <div className="form-group"> 
             <h3>Delete Account</h3>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">  
              <input
                type="password"
                placeholder="Enter password to confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button onClick={handleDeleteAccount} className="btn-delete">
              Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;