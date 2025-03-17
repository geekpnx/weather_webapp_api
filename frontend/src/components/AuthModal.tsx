import React, { useState, useEffect } from 'react';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRegisterMode: boolean; // Prop to determine initial mode
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  isRegisterMode,
  onLoginSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(!isRegisterMode); // Initialize state based on isRegisterMode

  // Synchronize isLogin with isRegisterMode prop
  useEffect(() => {
    setIsLogin(!isRegisterMode);
  }, [isRegisterMode]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        {isLogin ? (
          <>
            <LoginPage onLoginSuccess={onLoginSuccess} />
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)}>Sign Up</button>
            </p>
          </>
        ) : (
          <>
            <RegisterPage onRegisterSuccess={() => setIsLogin(true)} />
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)}>Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;