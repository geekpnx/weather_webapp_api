import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ProfileProvider } from './context/ProfileContext';

const App = () => {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <ProfileProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </Router>
        </ProfileProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
};

export default App;