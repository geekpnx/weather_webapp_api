import { usePreferences } from '../context/PreferencesContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = usePreferences();
  
  return (
    <div className="preference-row">
      <label className="preference-label">Theme</label>
      <div className="toggle-container">
        <div className="theme-toggle">
          <span className={`theme-label ${theme === 'light' ? 'active' : ''}`}>Light</span>
          <button
            type="button"
            className={`toggle-button ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
          >
            <div className="toggle-switch">
              <div className="toggle-knob" />
            </div>
          </button>
          <span className={`theme-label ${theme === 'dark' ? 'active' : ''}`}>Dark</span>
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;