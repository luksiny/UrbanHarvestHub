import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { IconCalendar, IconLocation, IconInstructor, IconUsers, IconPrice } from '../components/DetailMetaIcons';
import './Detail.css';

const getEventImage = (eventTitle) => {
  const imageMap = {
    'Spring Harvest Festival': '/images/products/harvestfesstivals.jpg',
    'Weekly Farmers Market': '/images/products/farmers-market.jpg'
  };
  return imageMap[eventTitle] || '/images/events/promoteenvironmentaw.jpeg';
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getById(id);
        const data = response?.data ?? response;
        setEvent(data ?? null);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-skeleton">
            <div className="detail-skeleton__media" />
            <div className="detail-skeleton__title" />
            <div className="detail-skeleton__line" />
            <div className="detail-skeleton__line short" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/events')}>
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) {
    return <div className="loading">Event not found</div>;
  }

  const imageUrl = event.image || getEventImage(event.title);

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn btn-secondary" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>

        <div className="detail-content">
          <div className="detail-main">
            <div className="detail-media">
              <img
                src={imageUrl}
                alt={event.title}
                className="detail-image"
              />
              <div className="detail-media-tag">
                <span className="badge">{event.category}</span>
              </div>
            </div>

            <h1>{event.title}</h1>

            <div className="detail-section">
              <h2>Description</h2>
              <p>{event.description}</p>
            </div>

            <div className="detail-info">
              <div className="detail-meta-grid">
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconCalendar /></span>
                  <span>{new Date(event.date).toLocaleString()}</span>
                </div>
                {event.endDate && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-icon" aria-hidden="true"><IconCalendar /></span>
                    <span>Ends {new Date(event.endDate).toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconLocation /></span>
                  <span>{event.location}</span>
                </div>
                {event.organizer && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-icon" aria-hidden="true"><IconInstructor /></span>
                    <span>{event.organizer}</span>
                  </div>
                )}
                {event.capacity != null && (
                  <div className="detail-meta-row">
                    <span className="detail-meta-icon" aria-hidden="true"><IconUsers /></span>
                    <span>{event.capacity} attendees</span>
                  </div>
                )}
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconPrice /></span>
                  <span>{event.price > 0 ? <span className="price">${event.price}</span> : <span className="detail-meta-free">Free</span>}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="booking-card card">
              <div className="booking-card-header">
                <h1 className="detail-title">{event.title}</h1>
                <div className="detail-price-badge">
                  {event.price > 0 ? `$${event.price}` : 'Free'}
                </div>
                <p className="detail-subtitle">
                  When: {new Date(event.date).toLocaleString()} · Where: {event.location}
                </p>
              </div>
              <button className="btn btn-primary">
                Register for Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
