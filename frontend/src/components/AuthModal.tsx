import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/user';
import { useAuth } from '../context/AuthContext';
import '../assets/css/AuthModal.css';
import { AuthModalProps } from '../types/types'

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (error) {
      timer = setTimeout(() => {
        setError('');
      },1000);
    }
  
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    }
  
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMessage]);

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

      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        </div>

        <div className="message-container">
        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="success-message show">
            {successMessage}
          </div>
        )}
      </div>
  
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        {mode === 'register' && (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name={mode === 'login' ? 'current-password' : 'new-password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
  
          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  autoComplete="off"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <div className="temperature-control">
                 <div className="switch-container">
                  <span className="switch-label">Temp. Unit:</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={preferredTemperatureUnit === 'F'}
                        onChange={() => setPreferredTemperatureUnit(prev => prev === 'C' ? 'F' : 'C')}
                      />
                      <span className="slider">
                        <span className="unit-text left">°C</span>
                        <span className="unit-text right">°F</span>
                      </span>
                    </label>
                  </div>
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