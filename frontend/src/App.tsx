import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginWrapper from './components/LoginWrapper'; // Import the wrapper component
import RegisterWrapper from './components/RegisterWrapper'; // Import the wrapper component
import UserProfilePage from './pages/UserProfilePage';
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} /> {/* Use LoginWrapper */}
          <Route path="/register" element={<RegisterWrapper />} /> {/* Use RegisterWrapper */}
          <Route path="/profile" element={<UserProfilePage />} /> {/* Profile Page Route */}
          <Route path="/" element={<HomePage />} /> {/* Home Page Route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;