/**
 * Ask the service worker to cache specific URLs for offline use.
 * Used by the Events page "Save to Offline" toggle.
 */
const getApiBase = () => {
  if (typeof window === 'undefined') return '';
  if (window.location.port === '3000') return `${window.location.origin}/api`;
  return process.env.REACT_APP_API_URL || `${window.location.origin}/api`;
};

export function getEventDetailApiUrl(eventId) {
  return `${getApiBase()}/events/${eventId}`;
}

export function cacheEventForOffline(eventId) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return Promise.resolve();
  }
  const url = getEventDetailApiUrl(eventId);
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => resolve();
    navigator.serviceWorker.controller.postMessage(
      { type: 'CACHE_URLS', urls: [url] },
      [channel.port2]
    );
    setTimeout(resolve, 3000);
  });
}

const SAVED_EVENTS_KEY = 'urbanHarvestHub_savedEventIds';

export function getSavedEventIds() {
  try {
    const raw = localStorage.getItem(SAVED_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setSavedEventIds(ids) {
  try {
    localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(ids));
  } catch {}
}
