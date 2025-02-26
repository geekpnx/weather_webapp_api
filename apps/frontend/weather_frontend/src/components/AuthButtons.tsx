import { Link, useNavigate } from 'react-router-dom';

const AuthButtons = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('auth_token'));

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/'); // Redirect to home after logout
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      {!isLoggedIn ? (
        <>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

export default AuthButtons;
