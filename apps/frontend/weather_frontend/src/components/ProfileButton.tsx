import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface ProfileButtonProps {
  isAuthenticated: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ isAuthenticated, onProfileClick, onLogout }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  if (!isAuthenticated) return null; // Don't render anything if not authenticated

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the profile page
    onProfileClick(); // Call the onProfileClick prop if needed
  };

  return (
    <div>
      <button onClick={handleProfileClick} style={{ marginLeft: '10px' }}>
        Profile
      </button>
      <button onClick={onLogout} style={{ marginLeft: '10px' }}>
        Logout
      </button>
    </div>
  );
};

export default ProfileButton;