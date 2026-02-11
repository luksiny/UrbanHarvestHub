import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSeedling, FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main">
      <Link
        to="/"
        className={`bottom-nav__item ${isActive('/') ? 'active' : ''}`}
        aria-current={isActive('/') ? 'page' : undefined}
      >
        <FaHome aria-hidden="true" />
        <span>Home</span>
      </Link>
      <Link
        to="/workshops"
        className={`bottom-nav__item ${isActive('/workshops') ? 'active' : ''}`}
        aria-current={isActive('/workshops') ? 'page' : undefined}
      >
        <FaSeedling aria-hidden="true" />
        <span>Workshops</span>
      </Link>
      <Link
        to="/products"
        className={`bottom-nav__item ${isActive('/products') ? 'active' : ''}`}
        aria-current={isActive('/products') ? 'page' : undefined}
      >
        <FaShoppingBag aria-hidden="true" />
        <span>Products</span>
      </Link>
      <Link
        to="/events"
        className={`bottom-nav__item ${isActive('/events') ? 'active' : ''}`}
        aria-current={isActive('/events') ? 'page' : undefined}
      >
        <FaCalendarAlt aria-hidden="true" />
        <span>Events</span>
      </Link>
      <Link
        to="/nearest-hub"
        className={`bottom-nav__item ${isActive('/nearest-hub') ? 'active' : ''}`}
        aria-current={isActive('/nearest-hub') ? 'page' : undefined}
      >
        <FaMapMarkerAlt aria-hidden="true" />
        <span>Near Me</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
