import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workshopsAPI } from '../services/api';
import { SkeletonGrid } from '../components/Skeleton';
import './Workshops.css';

const getWorkshopImage = (workshopTitle) => {
  const imageMap = {
    'Urban Gardening Basics': '/images/workshops/workshop1.jpg',
    'Preserving Your Harvest': '/images/workshops/preservingharvest.webp',
    'Sustainable Composting': '/images/workshops/composting.jpg'
  };
  return imageMap[workshopTitle] || '/images/workshops/workshop1.jpg';
};

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = ['Gardening', 'Cooking', 'Preservation', 'Sustainability', 'Other'];

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const params = {
          limit: 20,
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { category: categoryFilter })
        };
        const response = await workshopsAPI.getAll(params);
        const data = response?.data ?? response ?? [];
        setWorkshops(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching workshops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, [searchTerm, categoryFilter]);

  return (
    <div className="master-detail-page workshops-page">
      {/* Sticky glass search & filter bar */}
      <div className="master-detail-bar">
        <div className="container master-detail-bar__inner">
          <input
            type="search"
            className="master-detail-bar__input"
            placeholder="Search workshops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search workshops"
          />
          <select
            className="master-detail-bar__select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="container master-detail-content">
        <h1 className="master-detail-title">Workshops</h1>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : workshops.length === 0 ? (
          <div className="no-results">No workshops found. Try adjusting your search or filters.</div>
        ) : (
          <div className="master-detail-grid">
            {workshops.map(workshop => {
              const imageUrl = workshop.image || getWorkshopImage(workshop.title);
              return (
                <Link
                  key={workshop._id}
                  to={`/workshops/${workshop._id}`}
                  className="master-detail-card"
                >
                  <div className="master-detail-card__media">
                    <img
                      src={imageUrl}
                      alt=""
                      className="master-detail-card__image"
                      onError={(e) => { e.target.src = '/images/workshops/workshop1.jpg'; }}
                    />
                    <span className="master-detail-card__badge">{workshop.category}</span>
                  </div>
                  <div className="master-detail-card__body">
                    <h2 className="master-detail-card__title">{workshop.title}</h2>
                    <p className="master-detail-card__meta">
                      {workshop.instructor} · {new Date(workshop.date).toLocaleDateString()}
                    </p>
                    <p className="master-detail-card__excerpt">
                      {workshop.description ? workshop.description.substring(0, 120) + '…' : ''}
                    </p>
                    <div className="master-detail-card__footer">
                      <span className="master-detail-card__location">{workshop.location}</span>
                      <span className="master-detail-card__price">${workshop.price}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workshops;
