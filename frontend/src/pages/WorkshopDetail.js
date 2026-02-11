import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workshopsAPI, bookingsAPI } from '../services/api';
import { IconInstructor, IconCalendar, IconLocation, IconClock, IconUsers, IconPrice } from '../components/DetailMetaIcons';
import './Detail.css';

const WorkshopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        setLoading(true);
        const response = await workshopsAPI.getById(id);
        setWorkshop(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching workshop:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  const handleInputChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      await bookingsAPI.create({
        ...booking,
        workshopId: id,
        userId: booking.userEmail // Using email as user ID for simplicity
      });
      setSuccess(true);
      setBooking({
        userName: '',
        userEmail: '',
        userPhone: '',
        notes: ''
      });
      setTimeout(() => {
        navigate('/workshops');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (error && !workshop) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="btn btn-primary" onClick={() => navigate('/workshops')}>
          Back to Workshops
        </button>
      </div>
    );
  }

  if (!workshop) {
    return <div className="loading">Workshop not found</div>;
  }

  // Helper function to get workshop image path
  const getWorkshopImage = (workshopTitle) => {
    const imageMap = {
      'Urban Gardening Basics': '/images/workshops/workshop1.jpg',
      'Preserving Your Harvest': '/images/workshops/preservingharvest.webp',
      'Sustainable Composting': '/images/workshops/composting.jpg'
    };
    
    // Return mapped image or fallback
    return imageMap[workshopTitle] || '/images/workshops/workshop1.jpg';
  };

  const imageUrl =
    workshop.image || getWorkshopImage(workshop.title);

  return (
    <div className="detail-page">
      <div className="container">
        <button className="btn btn-secondary" onClick={() => navigate('/workshops')}>
          ← Back to Workshops
        </button>

        <div className="detail-content">
          <div className="detail-main">
            <div className="detail-media">
              <img
                src={imageUrl}
                alt={workshop.title}
                className="detail-image"
              />
              <div className="detail-media-tag">
                <span className="badge">{workshop.category}</span>
              </div>
            </div>
            
            <div className="detail-section">
              <h2>Description</h2>
              <p>{workshop.description}</p>
            </div>

            <div className="detail-info">
              <div className="detail-meta-grid">
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconInstructor /></span>
                  <span>{workshop.instructor}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconCalendar /></span>
                  <span>{new Date(workshop.date).toLocaleString()}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconClock /></span>
                  <span>{workshop.duration} hours</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconLocation /></span>
                  <span>{workshop.location}</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconUsers /></span>
                  <span>{workshop.available ?? workshop.capacity} spots available</span>
                </div>
                <div className="detail-meta-row">
                  <span className="detail-meta-icon" aria-hidden="true"><IconPrice /></span>
                  <span className="price">${workshop.price}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-sidebar">
            <div className="booking-card card">
              <div className="booking-card-header">
                <h1 className="detail-title">{workshop.title}</h1>
                <div className="detail-price-badge">
                  ${workshop.price}
                </div>
                <p className="detail-subtitle">
                  Enter your details below to sign up for this live workshop.
                </p>
              </div>
              {success && <div className="success">Booking successful! Redirecting...</div>}
              {error && <div className="error">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="userName"
                    className="input"
                    value={booking.userName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="userEmail"
                    className="input"
                    value={booking.userEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="userPhone"
                    className="input"
                    value={booking.userPhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    className="input"
                    rows="3"
                    value={booking.notes}
                    onChange={handleInputChange}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || workshop.available <= 0}
                >
                  {submitting ? 'Signing you up...' : `Sign Up for $${workshop.price}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
