import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register SW on load so PWA install (beforeinstallprompt) can fire reliably
function registerSW() {
  serviceWorkerRegistration.register({
    onSuccess: () => console.log('Service Worker registered successfully'),
    onUpdate: (registration) => {
      console.log('Service Worker updated – new content available');
      window.dispatchEvent(new CustomEvent('swUpdateAvailable', { detail: registration }));
      if (Notification.permission === 'granted') {
        try {
          new Notification('Urban Harvest Hub', {
            body: 'New events and products available! Refresh the app to see updates.',
            icon: '/images/icons/favicon.jpg',
            tag: 'app-update'
          });
        } catch (e) { /* ignore */ }
      }
    }
  });
}
window.addEventListener('load', () => setTimeout(registerSW, 100));
