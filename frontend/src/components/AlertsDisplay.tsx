import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/AlertsDisplay.css';
import warningIcon from '../assets/images/icons/warning-icon.svg';
import { useAuth } from '../context/AuthContext';
import { fetchWeatherAlerts } from '../api/weather';
import { WeatherAlert, AlertsDisplayProps } from '../types/types';
import { usePreventPullToRefresh } from '../hooks/usePreventPullToRefresh'


const AlertsDisplay: React.FC<AlertsDisplayProps> = ({ location }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, authToken } = useAuth();

  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  usePreventPullToRefresh(isDropdownOpen);

  useEffect(() => {
    if (isAuthenticated && authToken) {
      setIsLoading(true);
      setError(null);
      
      fetchWeatherAlerts(authToken, location)
        .then(data => {
          setAlerts(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch alerts');
          console.error('Error fetching alerts:', err);
          setIsLoading(false);
        });
    } else {
      setAlerts([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authToken, location]); 

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle touch events for dropdown
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dropdownRef.current) return;
    
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = touchStartY.current;
    isDragging.current = true;
  };


  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !dropdownRef.current) return;
    
    touchCurrentY.current = e.touches[0].clientY;
    const deltaY = touchCurrentY.current - touchStartY.current;
    
    // Check if we're trying to scroll the content
    if (dropdownContentRef.current) {
      const isScrolling = dropdownContentRef.current.scrollHeight > dropdownContentRef.current.clientHeight;
      const isAtTop = dropdownContentRef.current.scrollTop === 0;
      const isAtBottom = dropdownContentRef.current.scrollTop + dropdownContentRef.current.clientHeight >= 
                        dropdownContentRef.current.scrollHeight;
      
      // Allow content scrolling when not at boundaries or when scrolling up
      if (isScrolling && (
          (deltaY < 0 && !isAtBottom) || 
          (deltaY > 0 && !isAtTop)
        )) {
        isDragging.current = false;
        return;
      }
    }
    
    // Only allow downward swipe to close
    if (deltaY > 0) {
      dropdownRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !dropdownRef.current) return;
    
    const deltaY = touchCurrentY.current - touchStartY.current;
    
    // If swiped down more than 50px, close the dropdown
    if (deltaY > 50) {
      setIsDropdownOpen(false);
    } else {
      // Return to original position
      dropdownRef.current.style.transform = 'translateY(0)';
    }
    
    isDragging.current = false;
  };


  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && 
        alertButtonRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        !alertButtonRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  

  const hasActiveAlerts = alerts.length > 0;

  return (
    <div className="alerts-container">
      <button
        ref={alertButtonRef}
        className={`alerts-button ${hasActiveAlerts ? 'has-alerts' : ''}`}
        onClick={toggleDropdown}
        aria-label="View Weather Alerts"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="warning-icon-container">
          <img src={warningIcon} alt="Warning Icon" className="warning-icon" />
          {hasActiveAlerts && <span className="alert-badge"></span>}
        </div>
      </button>

      {isDropdownOpen && (
        <div 
          className={`alerts-dropdown ${!isDropdownOpen ? 'closed' : ''}`}
          ref={dropdownRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="alerts-dropdown-content"
            ref={dropdownContentRef}
          >
            {isLoading && <div className="alerts-loading">Loading alerts...</div>}
            {error && <div className="alerts-error">{error}</div>}
            
            {!isLoading && alerts.length === 0 && (
              <div className="alerts-empty">
                {location ? `No active alerts for ${location}` : 'No active alerts'}
              </div>
            )}
            
            {!isLoading && alerts.map((alert, index) => (
              <div key={index} className={`alert-card urgency-${alert.urgency?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                <h4 className="alert-headline">{alert.headline}</h4>
                <div className="alert-meta">
                  <span><strong>Event:</strong> {alert.event}</span>
                  <span><strong>Urgency:</strong> {alert.urgency}</span>
                </div>
                <p className="alert-description">{alert.desc}</p>
                <div className="alert-times">
                  <span>From: {new Date(alert.effective).toLocaleString()}</span>
                  <span>Until: {new Date(alert.expires).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsDisplay;