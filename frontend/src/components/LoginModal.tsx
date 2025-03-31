import React, { useState } from 'react';
import { loginUser } from '../api/user';  // Your existing login function
import '../../../backend/static/css/LoginModal.css'; // A separate CSS file
import { LoginModalProps } from '../types/types'; // New import


const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);   // (1) Show/Hide Password
  const [rememberMe, setRememberMe]   = useState(false);     // (2) Remember Me
  const [capsLockOn, setCapsLockOn]   = useState(false);     // (5) Caps Lock detection
  const [error, setError]             = useState('');

  // If modal isn't open, don't render anything
  if (!isOpen) return null;

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Attempt to log in
      const data = await loginUser(username, password);

      // If "Remember Me" is checked, store token in localStorage
      // else store it in sessionStorage, for example
      if (rememberMe) {
        localStorage.setItem('auth_token', data.token);
      } else {
        sessionStorage.setItem('auth_token', data.token);
      }

      // Optionally call success callback
      onLoginSuccess?.();
      // Then close the modal
      onClose();
    } catch (err) {
        setUsername('');
        setPassword('');
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  // Stop clicks inside the modal from closing it
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  // (5) Caps Lock detection
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCaps = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(isCaps);
  };

  return (
    <div className="login-modal-overlay" onClick={() => { onClose(); setError(''); setUsername('');
      setPassword('');}}>
      <div className="login-modal-content" onClick={stopPropagation}>
        <button className="login-modal-close" onClick={() => { onClose(); setError(''); setUsername('');
        setPassword('');}}>X</button>

        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="form-field">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password field with Show/Hide */}
          <div className="form-field">
            <label>Password:</label>
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}  // Caps Lock detection
                onKeyUp={handleKeyPress}
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {capsLockOn && <p style={{ color: 'orange' }}>Caps Lock is on!</p>}
          </div>

          {/* Remember Me checkbox */}
          <div className="remember-me-field">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember me
            </label>
          </div>

          {/* Error message */}
          {error && <p className="login-error">{error}</p>}

          {/* Submit button */}
          <button type="submit" className="login-submit-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
