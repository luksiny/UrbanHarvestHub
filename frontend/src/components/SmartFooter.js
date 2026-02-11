import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isAdminTokenValid } from '../utils/auth';
import './SmartFooter.css';

const iconSize = 18;
const lineIconSize = 16;

const IconCloudSlash = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCloudSync = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <path d="M18 12a6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6Z" />
  </svg>
);

const IconInstallApp = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconAbout = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);

const IconPrivacy = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconContact = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconTwitter = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const IconFacebook = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconInstagram = () => (
  <svg width={lineIconSize} height={lineIconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const SmartFooter = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installLoading, setInstallLoading] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() =>
    typeof window !== 'undefined' ? isAdminTokenValid() : false
  );

  useEffect(() => {
    const checkAdmin = () => setIsAdminLoggedIn(isAdminTokenValid());
    window.addEventListener('focus', checkAdmin);
    return () => window.removeEventListener('focus', checkAdmin);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const mqFull = window.matchMedia('(display-mode: fullscreen)');
    const check = () => setIsInstalled(mq.matches || mqFull.matches);
    check();
    mq.addEventListener('change', check);
    mqFull.addEventListener('change', check);
    return () => {
      mq.removeEventListener('change', check);
      mqFull.removeEventListener('change', check);
    };
  }, []);

  const handleInstall = async () => {
    if (installLoading || !deferredPrompt) return;
    setInstallLoading(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
    } catch (e) {}
    setDeferredPrompt(null);
    setInstallLoading(false);
  };

  const showInstallButton = !isInstalled && !!deferredPrompt;

  return (
    <footer className="smart-footer" role="contentinfo">
      <div className="smart-footer__inner">
        {/* Col 1: Status pill (left) */}
        <div className="smart-footer__col smart-footer__col--status">
          <div
            className={`smart-footer__status-pill ${!isOnline ? 'smart-footer__status-pill--offline' : ''}`}
            role="status"
            aria-live="polite"
          >
            <span className="smart-footer__status-icon" aria-hidden="true">
              {!isOnline ? <IconCloudSlash /> : <IconCloudSync />}
            </span>
            <span>{!isOnline ? 'Working Offline' : 'All Systems Syncing'}</span>
          </div>
        </div>

        {/* Col 2: Links + Social in one horizontal row */}
        <div className="smart-footer__col smart-footer__col--links">
          <nav className="smart-footer__row" aria-label="Footer">
            <Link to="/about" className="smart-footer__link" aria-label="About">
              <IconAbout />
            </Link>
            <Link to="/privacy" className="smart-footer__link" aria-label="Privacy">
              <IconPrivacy />
            </Link>
            <Link to="/contact" className="smart-footer__link" aria-label="Contact">
              <IconContact />
            </Link>
            <span className="smart-footer__row-divider" aria-hidden="true" />
            {isAdminLoggedIn ? (
              <Link to="/admin/dashboard" className="smart-footer__admin-link" aria-label="Go to admin dashboard">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/admin-login" className="smart-footer__admin-link" aria-label="Admin portal login">
                Admin Portal
              </Link>
            )}
            <span className="smart-footer__row-divider" aria-hidden="true" />
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="smart-footer__link" aria-label="Twitter">
              <IconTwitter />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="smart-footer__link" aria-label="Facebook">
              <IconFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="smart-footer__link" aria-label="Instagram">
              <IconInstagram />
            </a>
          </nav>
        </div>

        {/* Col 3: Install (right) – only when beforeinstallprompt active */}
        <div className="smart-footer__col smart-footer__col--install">
          {showInstallButton && (
            <button
              type="button"
              className="smart-footer__install-btn"
              onClick={handleInstall}
              disabled={installLoading}
              aria-label="Install Urban Harvest app"
            >
              <span className="smart-footer__install-icon" aria-hidden="true">
                <IconInstallApp />
              </span>
              <span>{installLoading ? 'Installing…' : 'Install App'}</span>
            </button>
          )}
        </div>

        {/* Tagline – full width below */}
        <p className="smart-footer__tagline">Powered by Eco-Tech</p>
      </div>
    </footer>
  );
};

export default SmartFooter;
