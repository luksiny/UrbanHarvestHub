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

// Defer SW registration until after first paint (improves LCP / TBT)
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
            icon: '/favicon.ico',
            tag: 'app-update'
          });
        } catch (e) { /* ignore */ }
      }
    }
  });
}
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(() => registerSW(), { timeout: 2000 });
} else {
  window.addEventListener('load', () => setTimeout(registerSW, 0));
}
