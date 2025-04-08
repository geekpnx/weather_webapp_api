import React, { useState, useEffect, useRef } from 'react';
import '../../../backend/static/css/AlertsDisplay.css';
import warningIcon from '../../../backend/static/images/icons/warning-icon.svg';
import { useAuth } from '../context/AuthContext';
import { fetchWeatherAlerts } from '../api/weather';
import { WeatherAlert } from '../types/types';

const AlertsDisplay: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, authToken } = useAuth();

  useEffect(() => {
    if (isAuthenticated && authToken) {
      setIsLoading(true);
      fetchWeatherAlerts(authToken)
        .then(data => {
          setAlerts(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch alerts.');
          console.error('Error fetching alerts:', err);
          setIsLoading(false);
        });
    } else {
      setAlerts([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authToken]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && alertButtonRef.current && !dropdownRef.current.contains(event.target as Node) && !alertButtonRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const hasActiveAlerts = alerts.length > 0;

  return (
    <div className="alerts-container" ref={dropdownRef}>
      <button
        ref={alertButtonRef}
        className={`alerts-button ${hasActiveAlerts ? 'has-alerts' : ''}`}
        onClick={toggleDropdown}
        aria-label="View Weather Alerts"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <img src={warningIcon} alt="Warning Icon" className="warning-icon" />
        {hasActiveAlerts && <div className="alert-notification-glow" />}
      </button>

      {isDropdownOpen && (
        <div className="alerts-dropdown">
          {isLoading && <div className="alerts-loading">Loading alerts...</div>}
          {error && <div className="alerts-error">{error}</div>}
          {!isLoading && alerts.length === 0 && <div className="alerts-empty">No active alerts.</div>}
          {!isLoading &&
            alerts.map((alert, index) => (
              <div key={index} className={`alert-card urgency-${alert.urgency?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                <h4 className="alert-headline">{alert.headline}</h4>
                <p className="alert-event"><strong>Event:</strong> {alert.event}</p>
                <p className="alert-type"><strong>Type:</strong> {alert.msgtype}</p>
                <p className="alert-urgency"><strong>Urgency:</strong> {alert.urgency}</p>
                <p className="alert-description">{alert.desc}</p>
                <p className="alert-effective">Effective: {new Date(alert.effective).toLocaleString()}</p>
                <p className="alert-expires">Expires: {new Date(alert.expires).toLocaleString()}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AlertsDisplay;