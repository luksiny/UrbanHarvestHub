import React, { useState, useEffect } from 'react';
import './UpdateBanner.css';

/**
 * Shows a banner when a new service worker has installed (app update available).
 * Optionally prompts for notification permission so users get push notifications for future updates.
 */
const UpdateBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handleUpdate = (e) => {
      setRegistration(e.detail || null);
      setShowBanner(true);
    };
    window.addEventListener('swUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  const handleRefresh = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        if (showBanner) {
          try {
            new Notification('Urban Harvest Hub', {
              body: 'You\'ll get notified when we have new events and products.',
              icon: '/favicon.ico'
            });
          } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { /* ignore */ }
  };

  if (!showBanner) return null;

  return (
    <div className="update-banner" role="alert">
      <div className="update-banner-content">
        <span className="update-banner-text">
          New events and products available! Refresh to see updates.
        </span>
        <div className="update-banner-actions">
          <button
            type="button"
            className="btn btn-primary update-banner-btn"
            onClick={handleRefresh}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-secondary update-banner-btn"
            onClick={handleEnableNotifications}
            title="Get browser notifications for future updates"
          >
            Notify me next time
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBanner;
