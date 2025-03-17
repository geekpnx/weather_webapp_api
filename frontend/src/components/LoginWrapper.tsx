import React from 'react';
import LoginPage from '../pages/LoginPage';
import { useAuth } from '../context/AuthContext';

const LoginWrapper: React.FC = () => {
  const { login } = useAuth(); // Use the login function from AuthContext
  return <LoginPage onLoginSuccess={login} />;
};

export default LoginWrapper;