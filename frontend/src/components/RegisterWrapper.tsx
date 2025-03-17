import React from 'react';
import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../context/AuthContext';

const RegisterWrapper: React.FC = () => {
  const { login } = useAuth(); // Use the login function from AuthContext
  return <RegisterPage onRegisterSuccess={() => login()} />;
};

export default RegisterWrapper;