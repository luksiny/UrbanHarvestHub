import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { workshopsAPI, eventsAPI } from '../services/api';
import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import './NearestHub.css';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const NearestHub = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearestWorkshops, setNearestWorkshops] = useState([]);
  const [nearestEvents, setNearestEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workshopsRes, eventsRes] = await Promise.all([
          workshopsAPI.getAll({ limit: 100 }),
          eventsAPI.getAll({ limit: 100 })
        ]);
        setWorkshops(workshopsRes.data || []);
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const findNearestHubs = useCallback(() => {
    const { lat, lng } = userLocation;

    // Calculate distances for workshops
    const workshopsWithDistance = workshops
      .filter(w => w.coordinates && w.coordinates.lat && w.coordinates.lng)
      .map(workshop => ({
        ...workshop,
        distance: calculateDistance(
          lat,
          lng,
          workshop.coordinates.lat,
          workshop.coordinates.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 nearest

    // Calculate distances for events
    const eventsWithDistance = events
      .filter(e => e.coordinates && e.coordinates.lat && e.coordinates.lng)
      .map(event => ({
        ...event,
        distance: calculateDistance(
          lat,
          lng,
          event.coordinates.lat,
          event.coordinates.lng
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // Top 5 nearest

    setNearestWorkshops(workshopsWithDistance);
    setNearestEvents(eventsWithDistance);
  }, [userLocation, workshops, events]);

  useEffect(() => {
    if (userLocation && (workshops.length > 0 || events.length > 0)) {
      findNearestHubs();
    }
  }, [userLocation, workshops, events, findNearestHubs]);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'Unable to get your location';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="nearest-hub-page">
      <div className="container">
        <h1>Find Nearest Hub</h1>
        <p className="subtitle">Discover workshops and events near you</p>

        <div className="location-section">
          <button
            className="btn btn-primary location-btn-large"
            onClick={getCurrentLocation}
            disabled={loading}
          >
            <FaMapMarkerAlt />
            {loading ? 'Getting Location...' : 'Get My Location'}
          </button>

          {error && <div className="error">{error}</div>}

          {userLocation && (
            <div className="location-info">
              <p>
                <strong>Your Location:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {nearestWorkshops.length > 0 && (
          <section className="nearest-section">
            <h2>
              <FaRoute /> Nearest Workshops
            </h2>
            <div className="grid">
              {nearestWorkshops.map((workshop) => (
                <Link
                  key={workshop._id}
                  to={`/workshops/${workshop._id}`}
                  className="card"
                >
                  <h3>{workshop.title}</h3>
                  <p className="text-light">{workshop.description ? workshop.description.substring(0, 100) + '...' : '—'}</p>
                  <div className="distance-info">
                    <FaMapMarkerAlt />
                    <span className="distance">{workshop.distance.toFixed(2)} km away</span>
                  </div>
                  <div className="card-footer">
                    <span className="badge">{workshop.category}</span>
                    <span className="price">${workshop.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {nearestEvents.length > 0 && (
          <section className="nearest-section">
            <h2>
              <FaRoute /> Nearest Events
            </h2>
            <div className="grid">
              {nearestEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="card"
                >
                  <h3>{event.title}</h3>
                  <p className="text-light">{event.description ? event.description.substring(0, 100) + '...' : '—'}</p>
                  <div className="distance-info">
                    <FaMapMarkerAlt />
                    <span className="distance">{event.distance.toFixed(2)} km away</span>
                  </div>
                  <div className="card-footer">
                    <span className="badge">{event.category}</span>
                    <span className="date">{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {userLocation && nearestWorkshops.length === 0 && nearestEvents.length === 0 && (
          <div className="no-results">
            <p>No workshops or events found with location data nearby.</p>
          </div>
        )}

        {!userLocation && (
          <div className="instruction-box">
            <p>Click "Get My Location" to find the nearest workshops and events to you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearestHub;