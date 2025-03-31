import React, { useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/user';
import { useAuth } from '../context/AuthContext';

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
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState('C');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label>Email:</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label>Password:</label>
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
              <div>
                <label>Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Preferred Unit:</label>
                <select
                  value={preferredTemperatureUnit}
                  onChange={(e) => setPreferredTemperatureUnit(e.target.value)}
                >
                  <option value="C">Celsius</option>
                  <option value="F">Fahrenheit</option>
                </select>
              </div>
            </>
          )}

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
        </form>

        <p>
          {mode === 'login' 
            ? "Don't have an account? "
            : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;