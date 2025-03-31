import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Home Page Route */}
      </Routes>
    </Router>
  );
};

export default App;
