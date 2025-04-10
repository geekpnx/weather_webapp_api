import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/user';
import { useAuth } from '../context/AuthContext';
import '../assets/css/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, userProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState<'C'|'F'>(
    userProfile?.preferred_temperature_unit || 'C'
  );
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userProfile?.preferred_temperature_unit) {
      setPreferredTemperatureUnit(userProfile.preferred_temperature_unit);
    }
  }, [userProfile?.preferred_temperature_unit]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reset mode when opening/closing modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setLocation('');
    setPreferredTemperatureUnit('C');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await loginUser(username, password);
        login();
        onClose();
      } else {
        // Handle registration without auto-login
        await registerUser(username, email, password, location, preferredTemperatureUnit);
        
        // Switch to login form with success message
        setMode('login');
        setSuccessMessage('Registration successful! Please login');
        // Clear all fields except username
        setPassword('');
        setEmail('');
        setLocation('');
        setPreferredTemperatureUnit('C');
      }
    } catch (error) {
      setError(
        error instanceof Error 
          ? error.message 
          : mode === 'login' 
            ? 'Login failed. Please check your credentials.'
            : 'Registration failed. Please try again.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {/* Global Messages */}
      {successMessage && (
        <div className="global-message success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="global-message error">
          {error}
        </div>
      )}

      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        </div>
  
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
  
          {mode === 'register' && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
  
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
  
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
              <label>Preferred Unit</label>
                <div className="temperature-toggle">
                  <span className="unit">°C</span>
                  <button
                    type="button"
                    className={`toggle-button ${preferredTemperatureUnit === 'F' ? 'active' : ''}`}
                    onClick={() => setPreferredTemperatureUnit(prev => prev === 'C' ? 'F' : 'C')}
                  >
                    <div className="toggle-switch">
                      <div className="toggle-knob" />
                    </div>
                  </button>
                  <span className="unit">°F</span>
                </div>
              </div>
            </>
          )}
  
          <button type="submit" className="submit-button">
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
  
        <div className="mode-toggle">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
;}

export default AuthModal;