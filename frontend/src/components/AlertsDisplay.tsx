import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/AlertsDisplay.css';
import warningIcon from '../assets/images/icons/warning-icon.svg';
import { useAuth } from '../context/AuthContext';
import { fetchWeatherAlerts } from '../api/weather';
import { WeatherAlert, AlertsDisplayProps } from '../types/types';

const AlertsDisplay: React.FC<AlertsDisplayProps> = ({ location }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const alertButtonRef = useRef<HTMLButtonElement>(null);
  const { isAuthenticated, authToken } = useAuth();
  const touchStartRef = useRef<number>(0);
  const scrollPositionRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      scrollPositionRef.current = 0;
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && 
        alertButtonRef.current && 
        !dropdownRef.current.contains(event.target as Node) && 
        !alertButtonRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!isDropdownOpen || !dropdownRef.current) return;
    
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    const header = dropdownRef.current.querySelector('.dropdown-header');
    
    // Only prevent default if touching the header
    if (header && header.contains(target)) {
      e.preventDefault();
      touchStartRef.current = touch.clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDropdownOpen || !isDraggingRef.current || !dropdownRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current;
    const dropdownHeight = dropdownRef.current.offsetHeight;
    
    if (deltaY > 0) {
      e.preventDefault();
      // Calculate percentage of how far we've dragged (0 to 1)
      const dragPercentage = Math.min(deltaY / dropdownHeight, 1);
      // Smooth the movement with easing
      const easedPercentage = easeOutQuad(dragPercentage);
      // Move the dropdown down proportionally
      dropdownRef.current.style.transform = `translateY(${easedPercentage * 100}%)`;
    }
  };

  // Add this easing function at the top of the file
  const easeOutQuad = (t: number) => {
    return t * (2 - t);
  };

  // Update the handleTouchEnd function
  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDropdownOpen || !dropdownRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartRef.current;
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const closeThreshold = 0.3; // Close if dragged 30% of the height
    
    if (deltaY / dropdownHeight > closeThreshold && isDraggingRef.current) {
      // Animate all the way down
      dropdownRef.current.style.transition = 'transform 0.2s ease-out';
      dropdownRef.current.style.transform = 'translateY(100%)';
      setTimeout(() => setIsDropdownOpen(false), 200);
    } else {
      // Return to original position
      dropdownRef.current.style.transition = 'transform 0.2s ease-out';
      dropdownRef.current.style.transform = '';
      setTimeout(() => {
        if (dropdownRef.current) {
          dropdownRef.current.style.transition = '';
        }
      }, 200);
    }
    
    isDraggingRef.current = false;
  };

  useEffect(() => {
    if (isDropdownOpen) {
      // Disable pull-to-refresh while dropdown is open
      document.body.style.overscrollBehaviorY = 'contain';
    } else {
      document.body.style.overscrollBehaviorY = '';
    }
    
    return () => {
      document.body.style.overscrollBehaviorY = '';
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    document.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    document.addEventListener('touchend', handleTouchEnd as EventListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart as EventListener);
      document.removeEventListener('touchmove', handleTouchMove as EventListener);
      document.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [isDropdownOpen]);

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
          className="alerts-dropdown"
          ref={dropdownRef}
        >
          <div 
            className="dropdown-header"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              touchStartRef.current = touch.clientY;
              isDraggingRef.current = true;
            }}
          >
            <div className="dropdown-handle"></div>
            {isLoading && <div className="alerts-loading">Loading alerts...</div>}
            {error && <div className="alerts-error">{error}</div>}
            {!isLoading && alerts.length === 0 && (
              <div className="alerts-empty">
                {location ? `No active alerts for ${location}` : 'No active alerts'}
              </div>
            )}
          </div>
          
          <div className="alerts-content">
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