import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { workshopsAPI, productsAPI, eventsAPI } from '../services/api';
import { getProductImage, resolveProductImagePath } from '../utils/productImages';
import './Home.css';

/* Hero image: leafy green garden (use hero-img.jpg or hero img.jpg in public/images/products) */
const HERO_IMAGE = '/images/products/hero-img.jpg';

// Helper function to get workshop image path
const getWorkshopImage = (workshopTitle) => {
  const imageMap = {
    'Urban Gardening Basics': '/images/workshops/workshop1.jpg',
    'Preserving Your Harvest': '/images/workshops/preservingharvest.webp',
    'Sustainable Composting': '/images/workshops/composting.jpg'
  };
  return imageMap[workshopTitle] || '/images/workshops/workshop1.jpg';
};

// Helper function to get event image path (default JPEG so image always loads in all browsers)
const getEventImage = (eventTitle) => {
  const imageMap = {
    'Spring Harvest Festival': '/images/products/harvestfesstivals.jpg',
    'Weekly Farmers Market': '/images/products/farmers-market.jpg',
    'Educational': '/images/products/educategardening.avif',
    'Gardening Education': '/images/products/educategardening.avif',
    'Community Garden': '/images/products/educategardening.avif',
  };
  return imageMap[eventTitle] || '/images/events/promoteenvironmentaw.jpeg';
};

const Home = () => {
  const [workshops, setWorkshops] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // all, seeds, live-workshops, tools, soil
  const homeRef = useRef(null);
  const sectionRefs = useRef([]); // kept for backwards compatibility with any stale ref callbacks

  useEffect(() => {
    const root = homeRef.current;
    if (!root) return;
    const sections = root.querySelectorAll('.home-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('animate-in');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [workshopsRes, productsRes, eventsRes] = await Promise.all([
          workshopsAPI.getAll({ limit: 3 }),
          productsAPI.getAll({ limit: 6, sort: 'name' }),
          eventsAPI.getAll({ limit: 3 })
        ]);
        
        // Handle response format: { success: true, data: [...], pagination: {...} } or raw array
        const workshopsRaw = workshopsRes?.data ?? workshopsRes;
        const productsRaw = productsRes?.data ?? productsRes;
        const eventsRaw = eventsRes?.data ?? eventsRes;
        setWorkshops(Array.isArray(workshopsRaw) ? workshopsRaw : []);
        setProducts(Array.isArray(productsRaw) ? productsRaw : []);
        setEvents(Array.isArray(eventsRaw) ? eventsRaw : []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load data. Make sure the backend server is running.');
        console.error('Error fetching data:', err);
        // Set empty arrays on error so UI doesn't break
        setWorkshops([]);
        setProducts([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const normalizedSearch = searchTerm.toLowerCase();

  const filterBySearch = (items, fields) => {
    if (!normalizedSearch) return items;
    return items.filter((item) =>
      fields.some((field) =>
        (item[field] || '').toLowerCase().includes(normalizedSearch)
      )
    );
  };

  // Base filtered collections by search term
  let filteredWorkshops = filterBySearch(workshops, ['title', 'description', 'category', 'location']);
  let filteredProducts = filterBySearch(products, ['name', 'description', 'category', 'seller']);
  let filteredEvents = filterBySearch(events, ['title', 'description', 'category', 'location']);

  // Category-based filtering for the home master view
  if (activeCategory === 'seeds') {
    filteredProducts = filteredProducts.filter((p) => p.category === 'Seeds');
  }

  if (activeCategory === 'tools') {
    filteredProducts = filteredProducts.filter((p) => p.category === 'Tools');
  }

  if (activeCategory === 'soil') {
    // If you later add a dedicated Soil category, update this check
    filteredProducts = filteredProducts.filter(
      (p) => p.category === 'Other' || (p.tags && p.tags.includes('soil'))
    );
  }

  const showWorkshops =
    activeCategory === 'all' || activeCategory === 'live-workshops';
  const showProducts =
    activeCategory === 'all' ||
    activeCategory === 'seeds' ||
    activeCategory === 'tools' ||
    activeCategory === 'soil';
  const showEvents = activeCategory === 'all';

  // Always render shell so LCP (hero) paints immediately; show loading only in data sections
  return (
    <div className="home" ref={homeRef}>
      <section className="hero" style={{ backgroundImage: `url(${HERO_IMAGE})` }}>
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container">
          <div className="hero-content">
            <h1>Find your next organic harvest</h1>
            <p>Discover local workshops, fresh produce, and community events.</p>
            <div className="search-pill-bar" role="search">
              <input
                type="search"
                className="search-pill-input glass"
                placeholder="Search workshops, products, events..."
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search workshops, products, and events"
              />
              <div className="filter-pills">
                <button
                  type="button"
                  className={`filter-pill glass ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('all')}
                  aria-pressed={activeCategory === 'all'}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`filter-pill glass ${activeCategory === 'seeds' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('seeds')}
                  aria-pressed={activeCategory === 'seeds'}
                >
                  Seeds
                </button>
                <button
                  type="button"
                  className={`filter-pill glass ${activeCategory === 'live-workshops' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('live-workshops')}
                  aria-pressed={activeCategory === 'live-workshops'}
                >
                  Workshops
                </button>
                <button
                  type="button"
                  className={`filter-pill glass ${activeCategory === 'tools' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('tools')}
                  aria-pressed={activeCategory === 'tools'}
                >
                  Tools
                </button>
                <button
                  type="button"
                  className={`filter-pill glass ${activeCategory === 'soil' ? 'active' : ''}`}
                  onClick={() => handleCategoryClick('soil')}
                  aria-pressed={activeCategory === 'soil'}
                >
                  Soil
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="error container">{error}</div>}

      <section className="about-section home-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Welcome to Urban Harvest Hub</h2>
              <p>
                Your one-stop for urban gardening, sustainable living, and community connection.
                Cultivate your own organic harvest in the heart of the city.
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <h3>Learn & Grow</h3>
                  <p>Hands-on workshops with expert instructors.</p>
                </div>
                <div className="feature-item">
                  <h3>Fresh Products</h3>
                  <p>Tools, seeds, and supplies for your garden.</p>
                </div>
                <div className="feature-item">
                  <h3>Community Events</h3>
                  <p>Farmers markets, festivals, and gatherings.</p>
                </div>
              </div>
              <div className="about-cta">
                <Link to="/workshops" className="btn btn-primary btn-accent">Get Started</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">

        {showWorkshops && (
          <section className="section home-section">
            <div className="section-header">
              <h2>Featured Workshops</h2>
              <Link to="/workshops" className="btn btn-secondary">View All</Link>
            </div>
            {loading ? (
              <div className="home-section-loading" aria-busy="true">Loading…</div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="no-results">
                <p>No workshops found. Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid bento-grid workshop-cards">
                {filteredWorkshops.map((workshop, index) => {
                  const imageUrl = workshop.image || getWorkshopImage(workshop.title);
                  return (
                    <Link
                      key={workshop._id}
                      to={`/workshops/${workshop._id}`}
                      className={`card bento-card workshop-card bento-card-${(index % 4) + 1}`}
                    >
                      <div className="workshop-image-container">
                        <img 
                          src={imageUrl} 
                          alt={workshop.title}
                          className="workshop-card-image"
                          width={320}
                          height={180}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.src = '/images/workshops/workshop1.jpg';
                          }}
                        />
                        <div className="workshop-card-overlay">
                          <h3 className="workshop-card-title">{workshop.title}</h3>
                          <span className="workshop-price-pill">${workshop.price}</span>
                        </div>
                      </div>
                      <p className="text-light workshop-card-desc">
                        {workshop.description ? workshop.description.substring(0, 120) + '...' : 'No description available.'}
                      </p>
                      <div className="card-footer">
                        <span className="badge">{workshop.category}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {showProducts && (
          <section className="section home-section">
            <div className="section-header">
              <h2>Fresh Products</h2>
              <Link to="/products" className="btn btn-secondary">View All</Link>
            </div>
            {loading ? (
              <div className="home-section-loading" aria-busy="true">Loading…</div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-results">
                <p>No products found. Try adjusting your search or filters.</p>
                <p className="text-light" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                  Make sure the backend server is running and the database has products.
                </p>
              </div>
            ) : (
              <div className="grid bento-grid">
                {filteredProducts.map((product, index) => {
                  const id = product._id ?? product.id ?? `product-${index}`;
                  const name = product.name ?? 'Product';
                  const price = product.price != null ? Number(product.price) : 0;
                  const imageUrl = resolveProductImagePath(product.image) || getProductImage(name, product.category) || '/images/products/trowel.jpg';
                  return (
                    <Link
                      key={id}
                      to={`/products/${id}`}
                      className={`card bento-card bento-card-${(index % 4) + 1}`}
                    >
                      <div className="product-image-container">
                        <img 
                          src={imageUrl} 
                          alt={name}
                          className="product-card-image"
                          width={320}
                          height={180}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/products/trowel.jpg';
                          }}
                        />
                      </div>
                      <h3>{name}</h3>
                      <p className="text-light">
                        {product.description ? product.description.substring(0, 120) + '...' : 'No description available.'}
                      </p>
                      <div className="card-footer">
                        <span className="badge">{product.category ?? 'Other'}</span>
                        <span className="price">${price.toFixed(2)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {showEvents && (
          <section className="section home-section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <Link to="/events" className="btn btn-secondary">View All</Link>
            </div>
            {loading ? (
              <div className="home-section-loading" aria-busy="true">Loading…</div>
            ) : filteredEvents.length === 0 ? (
              <div className="no-results">
                <p>No events found. Try adjusting your search or filters.</p>
                <p className="text-light" style={{ marginTop: 8, fontSize: '0.9rem' }}>
                  Make sure the backend server is running and the database has events.
                </p>
              </div>
            ) : (
              <div className="grid bento-grid">
                {filteredEvents.map((event, index) => {
                  const id = event._id ?? event.id ?? `event-${index}`;
                  const title = event.title ?? 'Event';
                  const imageUrl = event.image || getEventImage(title);
                  return (
                    <Link
                      key={id}
                      to={`/events/${id}`}
                      className={`card bento-card bento-card-${(index % 4) + 1}`}
                    >
                      <div className="event-image-container">
                        <img 
                          src={imageUrl} 
                          alt={title}
                          className="event-card-image"
                          width={320}
                          height={180}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/events/promoteenvironmentaw.jpeg';
                          }}
                        />
                      </div>
                      <h3>{title}</h3>
                      <p className="text-light">
                        {event.description ? event.description.substring(0, 120) + '...' : 'No description available.'}
                      </p>
                      <div className="card-footer">
                        <span className="badge">{event.category ?? 'Event'}</span>
                        <span className="date">
                          {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
