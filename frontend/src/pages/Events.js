import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { eventsAPI } from '../services/api';
import { SkeletonGrid } from '../components/Skeleton';
import {
  cacheEventForOffline,
  getSavedEventIds,
  setSavedEventIds,
} from '../utils/offlineCache';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './Events.css';

// Fix default marker icon in react-leaflet with bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getEventImage = (eventTitle) => {
  const imageMap = {
    'Spring Harvest Festival': '/images/products/harvestfesstivals.jpg',
    'Weekly Farmers Market': '/images/products/farmers-market.jpg',
  };
  return imageMap[eventTitle] || '/images/events/promoteenvironmentaw.jpeg';
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDateBadge(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()] || '—';
  return `${month} ${day}`;
}

function getEventCoords(event, index) {
  if (event.lat != null && event.lng != null && !Number.isNaN(event.lat) && !Number.isNaN(event.lng)) {
    return [Number(event.lat), Number(event.lng)];
  }
  const defaultCenter = [40.7128, -74.006];
  const offset = (index % 5) * 0.02 - 0.04;
  return [defaultCenter[0] + offset, defaultCenter[1] + offset];
}

function EventMap({ events }) {
  const markers = useMemo(() => {
    return events.map((event, i) => ({ event, coords: getEventCoords(event, i) }));
  }, [events]);

  if (markers.length === 0) return null;

  return (
    <div className="events-map-wrap" aria-label="Event locations map">
      <MapContainer
        center={markers[0].coords}
        zoom={12}
        className="events-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ event, coords }) => (
          <Marker key={event._id} position={coords}>
            <Popup>
              <strong>{event.title}</strong>
              <br />
              {event.location}
              <br />
              {new Date(event.date).toLocaleDateString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [savedIds, setSavedIds] = useState(getSavedEventIds);
  const [cachingId, setCachingId] = useState(null);

  const categories = ['Harvest Festival', 'Farmers Market', 'Community Garden', 'Educational', 'Social', 'Other'];

  useEffect(() => {
    setSavedIds(getSavedEventIds());
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { category: categoryFilter }),
        };
        const response = await eventsAPI.getAll(params);
        const data = response?.data ?? response ?? [];
        setEvents(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, categoryFilter]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const handleSaveToOfflineToggle = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedIds.includes(eventId);
    if (isSaved) {
      setSavedIds((prev) => {
        const next = prev.filter((id) => id !== eventId);
        setSavedEventIds(next);
        return next;
      });
      return;
    }
    setCachingId(eventId);
    setSavedIds((prev) => {
      const next = [...prev, eventId];
      setSavedEventIds(next);
      return next;
    });
    await cacheEventForOffline(eventId);
    setCachingId(null);
  };

  return (
    <div className="master-detail-page events-page">
      <div className="master-detail-bar">
        <div className="container master-detail-bar__inner">
          <input
            type="search"
            className="master-detail-bar__input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search events"
          />
          <select
            className="master-detail-bar__select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="container master-detail-content">
        <h1 className="master-detail-title">Events</h1>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : events.length === 0 ? (
          <div className="no-results">No events found. Try adjusting your search or filters.</div>
        ) : (
          <>
            <EventMap events={sortedEvents} />

            <div className="events-list" role="list">
              {sortedEvents.map((event) => {
                const imageUrl = event.image || getEventImage(event.title);
                const isSaved = savedIds.includes(event._id);
                const isCaching = cachingId === event._id;
                return (
                  <article
                    key={event._id}
                    className="event-list-card"
                    role="listitem"
                  >
                    <div className="event-list-card__date-badge" aria-hidden="true">
                      {formatDateBadge(event.date)}
                    </div>
                    <div className="event-list-card__content">
                      <Link to={`/events/${event._id}`} className="event-list-card__link">
                        <div className="event-list-card__media">
                          <img
                            src={imageUrl}
                            alt=""
                            className="event-list-card__image"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.src = '/images/events/promoteenvironmentaw.jpeg';
                            }}
                          />
                          <span className="event-list-card__badge">{event.category}</span>
                        </div>
                        <div className="event-list-card__body">
                          <h2 className="event-list-card__title">{event.title}</h2>
                          <p className="event-list-card__meta">
                            {new Date(event.date).toLocaleDateString()}
                            {event.organizer ? ` · ${event.organizer}` : ''}
                          </p>
                          <p className="event-list-card__excerpt">
                            {event.description ? event.description.substring(0, 120) + '…' : ''}
                          </p>
                          <div className="event-list-card__footer">
                            <span className="event-list-card__location">{event.location}</span>
                            {event.price > 0 ? (
                              <span className="event-list-card__price">${event.price}</span>
                            ) : (
                              <span className="event-list-card__price event-list-card__price--free">Free</span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="event-list-card__actions">
                        <label className="event-list-card__offline-toggle">
                          <input
                            type="checkbox"
                            checked={isSaved}
                            disabled={isCaching}
                            onChange={(e) => handleSaveToOfflineToggle(e, event._id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Save “${event.title}” for offline`}
                          />
                          <span className="event-list-card__offline-label">
                            {isCaching ? 'Saving…' : isSaved ? 'Saved' : 'Save to Offline'}
                          </span>
                        </label>
                        <Link
                          to={`/events/${event._id}`}
                          className="event-list-card__join-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Join Event
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
